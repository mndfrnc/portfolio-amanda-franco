# FBO — From Brief to Ops

**Creator Partnerships, CRM & Marketing Operations**

Experiência navegável local do case FBO, com visão executiva e evidência técnica expansível. Não publicada e sem dependências de rede em runtime.

## Abrir localmente

Na raiz do projeto:

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' Case/fbo/scripts/build-content.mjs
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' Case/fbo/scripts/serve.mjs
```

Acesse `http://127.0.0.1:4173/`. O catálogo do Design System está em `/design-system.html`.

## Escopo e proveniência

| Seção | Fontes canônicas |
|---|---|
| Contexto | `Case/input/briefing-criadora.md` |
| Brand Partnerships | `artifacts/inputs-for-crm-ops/` |
| Handoff | `artifacts/inputs-for-crm-ops/handoff-manifest.md` |
| CRM Architecture | `artifacts/crm-outputs/crm-architecture-data-dictionary.md` |
| Lifecycle e SLAs | `artifacts/crm-outputs/lifecycle-playbook.md` |
| Workflows | documentação canônica + `workflow_test_results.json` |
| Data quality | relatório canônico + dry-run, quarentena e rollback |
| SQL e Python | Analytics Library + resultados e reconciliação Q1–Q6 |
| Dashboard | especificação aprovada + dashboard técnico validado |
| QA e limitações | `artifacts/final-outputs/qa-signoff.md` |
| Evidências | Process Library, source map e arquivos técnicos |

O contrato completo está em `src/data/source-map.json`. `build-content.mjs` interrompe a geração quando uma fonte obrigatória está ausente. `validate-content.mjs` bloqueia naming divergente, métricas incompatíveis e afirmações de execução externa não sustentadas.

## Política de dados

- Marina Costa, seus números e histórico são fictícios.
- Marcas pesquisadas são pesquisa pública, não oportunidades confirmadas.
- Simulações não representam contato, resposta, negociação ou conversão.
- Resultados numéricos usam apenas `case_synthetic` e execução local.
- Nenhuma escrita em CRM, ativação de workflow, gasto, publicação ou contato externo ocorreu.

## Acessibilidade e navegadores

Implementação alvo: versões atuais de Chrome, Edge e Firefox. A interface oferece skip link, foco visível, navegação por teclado, drawer com retorno de foco, anúncios de filtro, alvos mínimos de 44 px, contraste textual, rótulos além da cor e suporte a `prefers-reduced-motion`/forced colors.

## Verificações

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' --test Case/fbo/tests/content-contract.spec.mjs Case/fbo/tests/catalog.spec.mjs
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules/playwright/cli.js test Case/fbo/tests/interactions.spec.mjs Case/fbo/tests/case-sections.spec.mjs Case/fbo/tests/accessibility.spec.mjs Case/fbo/tests/responsive.spec.mjs Case/fbo/tests/visual-regression.spec.mjs
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' Case/fbo/scripts/checkpoint.mjs
```

## Limitações preservadas

QA-004 permanece aberta. Não houve qualificação comercial real, outreach, negociação, CRM em produção, workflows reais, performance/receita observada ou publicação. Qualquer apresentação pública requer aprovação humana específica.
