import io
import re
from pathlib import Path

import pandas as pd
import requests
from pypdf import PdfReader

PDFS = {
    "2026-01": [
        "https://mpce.mp.br/wp-content/uploads/2026/02/Relatorio-Produtividade-Promotores-JAN-2026.pdf",
        "https://mpce.mp.br/wp-content/uploads/2026/02/PRODUTIVIDADE-PROMOTORES-JANEIRO-2026.pdf",
        "https://mpce.mp.br/wp-content/uploads/2026/03/Relatorio-Produtividade-Promotores-JAN-2026.pdf",
        "https://mpce.mp.br/wp-content/uploads/2026/02/PROMOTORES.pdf",
    ],
    "2026-02": [
        "https://mpce.mp.br/wp-content/uploads/2026/03/Relatorio-Produtividade-Promotores-FEV-2026.pdf",
    ],
    "2026-03": [
        "https://mpce.mp.br/wp-content/uploads/2026/05/Relatorio-Produtividade-Promotores-MARCO-2026-corrigido.pdf",
        "https://mpce.mp.br/wp-content/uploads/2026/04/Relatorio-Produtividade-Promotores-MARCO-2026.pdf",
    ],
    "2026-04": [
        "https://mpce.mp.br/wp-content/uploads/2026/05/Relatorio-Produtividade-Promotores-ABRIL-2026-correigido.pdf",
    ],
    "2026-05": [
        "https://mpce.mp.br/wp-content/uploads/2026/06/Produtividade-Promotores.pdf",
    ],
    "2026-06": [
        "https://mpce.mp.br/wp-content/uploads/2026/07/Relatorio-Produtividade-Promotores-JUN-2026.pdf",
    ],
}

LINHA = re.compile(r"^(?P<code>\d+)\s+(?P<label>920\d+.*)\s+(?P<n>\d+)\s*$")
SESSION = requests.Session()
SESSION.headers["User-Agent"] = "pesquisa-transparencia-mpce/1.0"
FOCO = ("920258", "920259", "920015", "920482")


def achar_pdf(urls: list[str]) -> tuple[str, bytes] | None:
    for url in urls:
        r = SESSION.get(url, timeout=180)
        print(f"  {r.status_code} {url} ({len(r.content)} bytes)")
        if r.status_code == 200 and r.content[:4] == b"%PDF":
            return url, r.content
    return None


def extrair(content: bytes, competencia: str) -> list[dict]:
    reader = PdfReader(io.BytesIO(content))
    first = (reader.pages[0].extract_text() or "")[:200].replace("\n", " | ")
    print(f"  pages={len(reader.pages)} head={first[:140]!r}")
    rows = []
    for page in reader.pages:
        for raw in (page.extract_text() or "").splitlines():
            line = re.sub(r"\s+", " ", raw).strip()
            if line.lower().startswith("subtotal"):
                continue
            m = LINHA.match(line)
            if not m:
                continue
            rows.append(
                {
                    "competencia": competencia,
                    "codigo": m.group("code"),
                    "label": m.group("label"),
                    "qtd": int(m.group("n")),
                }
            )
    return rows


def main():
    todos = []
    for comp, urls in PDFS.items():
        print(f"=== {comp} ===")
        found = achar_pdf(urls)
        if not found:
            print("  nao achou")
            continue
        todos.extend(extrair(found[1], comp))

    df = pd.DataFrame(todos)
    out = Path(__file__).resolve().parents[1] / "data"
    df.to_parquet(out / "produtividade_taxonomia_2026_1s.parquet", index=False)
    foco = df[df["codigo"].isin(FOCO)]
    cruz = foco.groupby(["competencia", "codigo"])["qtd"].sum().unstack(fill_value=0)
    print("\n=== FOCO ===")
    print(cruz.to_string())
    print("\n=== TOTAIS ===")
    print(foco.groupby("codigo")["qtd"].sum().to_string())
    cruz.to_csv(out / "produtividade_taxonomia_2026_1s_foco.csv")


if __name__ == "__main__":
    main()
