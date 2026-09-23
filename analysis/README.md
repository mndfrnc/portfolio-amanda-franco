# Pipeline Health — análise reproduzível

O case usa cinco CSVs do conjunto público e fictício **CRM Sales Opportunities**, da Maven Analytics: contas, produtos, pipeline, equipes e dicionário de dados. A fonte o disponibiliza sob licença Public Domain.

## Pergunta

Onde a operação comercial deveria agir primeiro com base no histórico e no pipeline aberto?

## Fluxo

1. `build_case.py` relaciona as quatro tabelas de negócio.
2. Normaliza `GTXPro` para `GTX Pro`, `technolgy` para `technology` e `Philipines` para `Philippines`.
3. Cria uma base SQLite local.
4. `sql/business_analysis.sql` produz as agregações do dashboard.
5. Python calcula idade, prioridade e motivos da fila operacional.
6. O JSON público é gerado em `public/pipeline-health/data/dashboard.json`.

## Regra de prioridade

- Crítica: oportunidade em Engaging há 180 dias ou mais.
- Alta: oportunidade em Engaging há 90 a 179 dias ou sem conta associada.
- Monitorar: demais oportunidades em Engaging.

A regra organiza revisão. Ela não prevê conversão e não executa contato.

## Limites

A base não contém atividades, histórico de estágio, origem, campanha, contatos, metas, custos ou margem. O preço de lista aparece no dashboard somente como valor de referência, nunca como forecast.
