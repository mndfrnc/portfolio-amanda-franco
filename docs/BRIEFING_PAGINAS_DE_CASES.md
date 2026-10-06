# Briefing para as páginas de cases

## Objetivo

Criar páginas de case para apresentar o processo de Amanda com clareza, critério e contexto. O portfólio deve mostrar como ela transforma informações, relações e processos em experiências e operações claras, estruturadas e utilizáveis.

O tom combina atenção às pessoas e rigor na estrutura. Cada página deve explicar o problema, as decisões e o que foi construído sem preencher lacunas com resultados inventados.

## Cases e rotas

| Case | Rota | Situação |
| --- | --- | --- |
| English Tool | `/cases/english-tool` | Criar página completa. |
| Leo no WhatsApp | `/cases/leo-no-whatsapp` | Criar página completa. |
| Pipeline Health | `/crm` | Já existe e é explorável. Preservar suas rotas, dados e dashboard. |

O card atual do English Tool aparece como “English Toolkit” na home. Antes de publicar sua página, alinhar o título do card com o nome final adotado no case.

## Sistema visual aprovado

- Wordmark principal: `amanda*`, preto, com asterisco magenta.
- Cores: papel `#F4F0E8`, tinta `#101010`, verde-limão `#B6F000`, magenta `#E83E8C`.
- Tipografia: Georgia para títulos e destaques editoriais; fonte de sistema para navegação, dados e corpo de texto.
- Layout: editorial, arejado, tipografia com presença e hierarquia clara. Usar linhas finas, numeração e blocos de informação; evitar cards genéricos, gradientes e ornamentos que disputem espaço com o conteúdo.
- Fotos: preto e branco, sem molduras, fitas, sombras deslocadas ou inclinação. A assinatura manual é um recurso pontual, já usado na apresentação da página inicial.
- Mobile: priorizar leitura contínua, corpo de texto legível e imagens sem recorte involuntário.

Os estilos da página inicial estão em `src/styles/site-redesign.css` e são a referência visual do projeto.

## Estrutura sugerida para cada página

1. **Abertura**
   - Nome do case.
   - Área e tipo de projeto.
   - Uma frase que descreva o problema ou a intenção do trabalho.

2. **Contexto**
   - O cenário que motivou o projeto.
   - Para quem a solução foi pensada.
   - O que precisava ser compreendido ou organizado.

3. **Meu papel**
   - O que Amanda concebeu, decidiu, construiu ou coordenou.
   - Separar com precisão o que foi executado do que foi proposto.

4. **Processo e decisões**
   - Apresentar etapas, critérios e escolhas relevantes.
   - Usar quadros de leitura rápida para decisões, ferramentas ou princípios quando ajudarem a leitura.

5. **Entrega**
   - O que existe hoje: produto, análise, arquitetura, dashboard, protótipo, automação ou documentação.
   - Quando houver, incluir link para explorar a entrega.

6. **Aprendizados e próximos passos**
   - Fechar com o que o trabalho tornou visível ou possível.
   - Não transformar hipótese, intenção ou proposta em resultado realizado.

## Conteúdo por case

### English Tool

- Produto educacional autoral para prática de inglês.
- Proposta: conteúdos curados em uma experiência de aprendizagem mais clara, organizada e sustentável no dia a dia.
- Elementos já definidos: vídeo curado, completar frases, repetição espaçada e e-book autoral em duas partes.
- Modelo de acesso: vitalício, R$ 27.
- O case deve abordar a lógica pedagógica, a experiência de uso e as decisões de produto. Não atribuir impacto de aprendizagem sem evidência documentada.

### Leo no WhatsApp

- Assistente pessoal criado para organizar pensamentos, acompanhar projetos e apoiar automações no WhatsApp.
- Arquitetura existente: WhatsApp, Evolution API, n8n, Postgres, Redis, Caddy, Docker e Oracle A2.Flex; memória curta em JSON e fluxos WA-001 a WA-004.
- O case deve evidenciar as decisões de experiência conversacional, contexto, memória, privacidade e limites pessoais.
- Não expor credenciais, números de telefone, dados pessoais ou conteúdos privados de conversas.

### Pipeline Health

- Já publicado em `/crm`, com dashboard em `/crm/dashboard`.
- Base analisada: 8.800 oportunidades.
- Achados documentados: 90,4%; 1.479 oportunidades com 90+ dias; 1.088 sem conta; 748 na região West.
- A página do case deve manter a separação entre análise construída e propostas operacionais. O dashboard e os dados existentes não devem ser alterados.

## Regras editoriais

- Escrever em primeira pessoa quando Amanda estiver descrevendo suas decisões.
- Preferir contexto → percepção → decisão → entrega.
- Usar português claro, direto e humano.
- Não usar promessas vagas nem frases motivacionais.
- Não inventar métricas, impactos, clientes, depoimentos ou resultados.
- Quando uma informação ainda não estiver disponível, marcar como pendente em vez de completar por suposição.

## Referências técnicas

- Projeto em Astro.
- Página inicial: `src/pages/index.astro`.
- Cards da home: `src/components/Cases.astro`.
- Dados dos cards: `src/data/cases.js`.
- Estilos do redesign: `src/styles/site-redesign.css`.
- Pipeline Health: `src/pages/crm.astro` e `src/pages/crm/dashboard.astro`.

Criar as novas páginas sem remover ou alterar a home, o CRM, o dashboard, credenciais ou configurações existentes.
