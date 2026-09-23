import { createFocusTrap } from "./a11y.js";

export function initViewModes() {
  const buttons = [...document.querySelectorAll("[data-view-mode]")];
  const setViewMode = mode => {
    document.documentElement.dataset.view = mode;
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.viewMode === mode)));
    document.querySelectorAll("details[data-evidence]").forEach(details => details.open = mode === "technical");
  };
  buttons.forEach(button => button.addEventListener("click", () => setViewMode(button.dataset.viewMode)));
  setViewMode("executive");
  return setViewMode;
}

const evidence = {
  context: { title:"Briefing e contexto", description:"Premissas narrativas do case.", scope:"Fictício", state:"Documentado", path:"Case/input/briefing-criadora.md", why:"Define a persona e o problema; não comprova performance.", hashName:null },
  architecture: { title:"Arquitetura operacional", description:"Contrato lógico e biblioteca de processos.", scope:"Documentação", state:"Projetado", path:"artifacts/crm-outputs/crm-architecture-data-dictionary.md", why:"Sustenta objetos, propriedades, associações e controles.", hashName:null },
  technical: { title:"Validação técnica", description:"Execução local sobre dados controlados.", scope:"case_synthetic", state:"Executado localmente", path:"Case/technical-validation/2026-09-21-064413/", why:"Sustenta as métricas observadas do dry-run e dos testes.", hashName:"analytics_reconciliation.json" },
  qa: { title:"QA Sign-off", description:"Conclusão e limites da iteração técnica.", scope:"Local/sintético", state:"QA-001/003 fechadas; QA-004 aberta", path:"artifacts/final-outputs/qa-signoff.md", why:"Sustenta o status final sem autorizar publicação ou go-live.", hashName:"workflow_test_results.json" }
};

export function initEvidenceDrawer(data = {}) {
  const drawer = document.querySelector("[data-evidence-drawer]");
  const close = document.querySelector("[data-close-evidence]");
  if (!drawer || !close) return;
  const trap = createFocusTrap(drawer, close);
  const fields = { title:"[data-evidence-title]", description:"[data-evidence-description]", scope:"[data-evidence-scope]", state:"[data-evidence-state]", path:"[data-evidence-path]", why:"[data-evidence-why]" };
  const meta=drawer.querySelector(".case-drawer__meta");const validation=document.createElement("li");validation.innerHTML=`<strong>Última validação</strong><br>${data.generatedAt ?? "não disponível"}`;const hash=document.createElement("li");hash.innerHTML="<strong>SHA-256</strong><br>";const hashCode=document.createElement("code");hashCode.dataset.evidenceHash="";hash.append(hashCode);meta?.append(validation,hash);
  document.querySelectorAll("[data-open-evidence]").forEach(button => button.addEventListener("click", () => {
    const item = evidence[button.dataset.openEvidence];
    for (const [key, selector] of Object.entries(fields)) drawer.querySelector(selector).textContent = item[key];
    hashCode.textContent=item.hashName ? (data.hashes?.[item.hashName] ?? "hash não publicado para esta fonte") : "hash não publicado para esta fonte";
    trap.show(button);
  }));
  close.addEventListener("click", trap.hide);
}
