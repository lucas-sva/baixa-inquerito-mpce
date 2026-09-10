import re

import requests

html = requests.get(
    "https://mpce.mp.br/portal-da-transparencia/atividade-fim/produtividade-por-membro/",
    timeout=60,
    headers={"User-Agent": "pesquisa-transparencia-mpce/1.0"},
).text
for m in re.finditer(
    r'href="(https://mpce\.mp\.br/wp-content/uploads/[^"]+\.pdf)"[^>]*>([^<]*)',
    html,
):
    url, title = m.group(1), m.group(2)
    blob = url + title
    if re.search(r"PROMOTOR|Promotor", blob, re.I):
        print(f"{title.strip()[:90]} | {url}")
