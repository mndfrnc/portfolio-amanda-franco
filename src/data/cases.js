// Conteúdo real dos cases, condensado a partir de
// 01_INPUT/ESCOPO_PROVISORIO_CASES_PORTFOLIO_AMANDA_FRANCO.docx (copy provisória da V1).
// Nada aqui foi inventado: o documento não traz métricas nem resultados fechados porque os
// três projetos ainda estão em desenvolvimento/documentação — por isso o 4º campo é
// "Estágio atual" em vez de "Resultado".
//
// Para editar os cases: mude só os textos abaixo. Cada case tem 4 campos de síntese, na
// mesma ordem em que aparecem no card (contexto, papel de Amanda, decisões/solução, estágio).

export const camposSintese = ["Contexto", "Papel de Amanda", "Decisões / solução", "Estágio atual"];

export const cases = [
  {
    titulo: "English Tool",
    tag: "Produto digital · experiência de aprendizagem · tecnologia",
    badge: "Case completo e explorável",
    href: "/cases/english-tool",
    sintese: [
      "Projeto autoral para transformar conteúdos de inglês em uma experiência de " +
        "aprendizagem mais clara, organizada e possível de manter no dia a dia.",
      "Concepção do produto e desenvolvimento de uma aplicação local-first, com " +
        "sincronização entre dispositivos.",
      "Estrutura de microaulas e organização do progresso como espinha dorsal da " +
        "experiência de uso.",
      "Concluído — ver case completo.",
    ],
  },
  {
    titulo: "Leo no WhatsApp",
    tag: "Inteligência artificial · automação · experiência conversacional",
    badge: "Tratamento cuidadoso de dados e privacidade",
    href: "/cases/leo-no-whatsapp",
    sintese: [
      "Assistente pessoal desenvolvido no WhatsApp para explorar como IA, memória, " +
        "automação e contexto formam uma experiência mais contínua e humana.",
      "Concepção do projeto e integração das ferramentas envolvidas, com atenção às " +
        "decisões de experiência conversacional.",
      "Cuidados específicos para preservar privacidade e limites pessoais no uso da " +
        "automação.",
      "Estrutura principal funcional — ver case completo.",
    ],
  },
  {
    titulo: "Pipeline Health",
    tag: "CRM · análise de dados · automação · revenue operations",
    badge: "Case completo e explorável",
    href: "/crm",
    sintese: [
      "Análise de 8.800 oportunidades para entender a saúde do pipeline e localizar " +
        "o que impedia uma fila de follow-up confiável.",
      "Preparação dos dados, exploração com SQL e Python e tradução dos achados em " +
        "prioridades operacionais de CRM.",
      "Dashboard explorável, views de acompanhamento e duas automações simples para " +
        "revisão de oportunidades envelhecidas e enriquecimento de contas.",
      "Concluído — ver análise e dashboard.",
    ],
  },
];
