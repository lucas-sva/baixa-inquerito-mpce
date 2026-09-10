# Análise independente: baixa de inquérito policial no MPCE

Não é site oficial do Ministério Público do Ceará.

Números extraídos dos relatórios públicos de produtividade de promotores (Corregedoria do MPCE), jul/2025 a jun/2026. Códigos SAJ:

- `920258` — baixa de inquérito policial **com** diligência
- `920259` — baixa de inquérito policial **sem** diligência
- `920015` — denúncia escrita
- `920482` — termo de acordo de não persecução penal (ANPP)

Série mensal em `data/serie-mensal.csv`.

Este site não publica nomes, peças ou microdados de inquéritos. A lista individual do portal da transparência contém dados pessoais e fica fora do repositório.

## Como ver localmente

Abra `index.html` no navegador ou sirva a pasta:

```bash
python -m http.server 8080
```

## GitHub Pages

O site é estático (HTML/CSS/JS). Após o push, Pages publica a raiz de `main`.
