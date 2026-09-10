import io
import re
from pathlib import Path

import pandas as pd
import requests
from pypdf import PdfReader

PDFS = {
    "2025-07": "https://mpce.mp.br/wp-content/uploads/2025/08/PROMOTORES.pdf",
    "2025-08": "https://mpce.mp.br/wp-content/uploads/2025/09/PRODUTIVIDADE-PROMOTORES.pdf",
    "2025-09": "https://mpce.mp.br/wp-content/uploads/2025/10/Relatorio-Produtividade-Promotores-SET-2025-1.pdf",
    "2025-10": "https://mpce.mp.br/wp-content/uploads/2025/11/PROMOTORES-1.pdf",
    "2025-11": "https://mpce.mp.br/wp-content/uploads/2025/12/RELATORIO-PRODUTIVIDADE-PROMOTORES-NOVEMBRO-2025.pdf",
    "2025-12": "https://mpce.mp.br/wp-content/uploads/2026/01/PRODUTIVIDADE-PROMOTORES-dezembro.pdf",
}

LINHA = re.compile(
    r"^(?P<code>\d+)\s+(?P<label>920\d+.*)\s+(?P<n>\d+)\s*$"
)

SESSION = requests.Session()
SESSION.headers["User-Agent"] = "pesquisa-transparencia-mpce/1.0"


def classificar(label: str) -> str:
    u = label.upper()
    if "DENÚNCIA" in u or "DENUNCIA" in u:
        return "denuncia"
    if "NÃO PERSECUÇÃO" in u or "NAO PERSECUCAO" in u or "ANPP" in u:
        return "anpp"
    if "ARQUIVAMENTO" in u:
        if "JUDICI" in u:
            return "arquivamento_com_remessa_juizo"
        return "arquivamento_outros"
    if "DILIG" in u:
        return "diligencias"
    if "AJUIZAMENTO" in u or "PETIÇÃO INICIAL" in u or "PETICAO INICIAL" in u:
        return "ajuizamento_peticao_inicial"
    return "outros"


def extrair(url: str, competencia: str) -> list[dict]:
    r = SESSION.get(url, timeout=180)
    r.raise_for_status()
    reader = PdfReader(io.BytesIO(r.content))
    rows = []
    for page in reader.pages:
        text = page.extract_text() or ""
        for raw in text.splitlines():
            line = re.sub(r"\s+", " ", raw).strip()
            if line.lower().startswith("subtotal"):
                continue
            m = LINHA.match(line)
            if not m:
                continue
            label = m.group("label")
            rows.append(
                {
                    "competencia": competencia,
                    "codigo": m.group("code"),
                    "label": label,
                    "qtd": int(m.group("n")),
                    "classe": classificar(label),
                }
            )
    return rows


def main():
    todos = []
    for comp, url in PDFS.items():
        print(f"parse {comp}")
        lote = extrair(url, comp)
        print(f"  {len(lote)} linhas, soma {sum(x['qtd'] for x in lote)}")
        todos.extend(lote)

    df = pd.DataFrame(todos)
    out = Path(__file__).resolve().parents[1] / "data"
    df.to_parquet(out / "produtividade_taxonomia_2025_2s.parquet", index=False)

    cruz = df.groupby(["competencia", "classe"])["qtd"].sum().unstack(fill_value=0)
    print("\n=== CRUZAMENTO competencia x classe ===")
    print(cruz.to_string())
    print("\n=== TOTAL 2o semestre ===")
    print(df.groupby("classe")["qtd"].sum().sort_values(ascending=False).to_string())
    print("\n=== TOP CODIGOS denuncia/arq/dilig ===")
    foco = df[df["classe"] != "outros"]
    top = (
        foco.groupby(["classe", "codigo", "label"])["qtd"]
        .sum()
        .reset_index()
        .sort_values(["classe", "qtd"], ascending=[True, False])
    )
    print(top.head(40).to_string(index=False))
    top.to_csv(out / "produtividade_taxonomia_2025_2s_foco.csv", index=False)
    cruz.to_csv(out / "produtividade_taxonomia_2025_2s_cruzamento.csv")


if __name__ == "__main__":
    main()
