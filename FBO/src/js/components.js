function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(options)) {
    if (key === "className") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key.startsWith("data-")) node.setAttribute(key, value);
    else if (key in node) node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

export function Badge(text, tone = "blue") { return el("span", { className:`badge badge--${tone}`, text }); }
export function Button(text, quiet = false) { return el("button", { className:`button${quiet ? " button--quiet" : ""}`, type:"button", text }); }
export function Card(title, body, tone = "") { return el("article", { className:"card component-demo", ...(tone ? {"data-tone":tone}: {}) }, [el("h3",{text:title}), el("p",{text:body})]); }
export function SourceLine(path) { return el("p", { className:"source-line", text:`Fonte: ${path}` }); }
export function SyntheticKpiCard({ label, value, sourceRef }) { const card=Card(label,value,"blue"); card.append(Badge("case_synthetic","yellow"), el("p",{text:"DADOS SINTÉTICOS — VALIDAÇÃO LOCAL"}), SourceLine(sourceRef)); return card; }
export function Disclosure() { const wrap=el("div"); const button=Button("Ver evidência técnica",true); const panel=el("div",{className:"disclosure-panel",hidden:true},SourceLine("artifacts/final-outputs/qa-signoff.md")); button.setAttribute("aria-expanded","false"); button.addEventListener("click",()=>{const open=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!open));panel.hidden=open;}); wrap.append(button,panel); return wrap; }
export function Tabs() { const wrap=el("div",{className:"tabs"}); const list=el("div",{role:"tablist",ariaLabel:"Nível de leitura"}); const panels=[el("div",{role:"tabpanel",text:"Síntese executiva",id:"catalog-panel-executive"}),el("div",{role:"tabpanel",text:"Evidência técnica",id:"catalog-panel-technical",hidden:true})]; const tabs=[]; const activate=index=>{tabs.forEach((item,i)=>{item.setAttribute("aria-selected",String(i===index));item.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;});tabs[index].focus();}; ["Executivo","Técnico"].forEach((label,index)=>{const tab=el("button",{role:"tab",type:"button",text:label,tabIndex:index? -1:0,id:`catalog-tab-${index}`});tab.setAttribute("aria-selected",String(index===0));tab.setAttribute("aria-controls",panels[index].id);panels[index].setAttribute("aria-labelledby",tab.id);tab.addEventListener("click",()=>activate(index));tab.addEventListener("keydown",event=>{if(["ArrowRight","ArrowLeft","Home","End"].includes(event.key)){event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?tabs.length-1:(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;activate(next);}});tabs.push(tab);list.append(tab);});wrap.append(list,...panels);return wrap; }
export function EvidenceDrawer() { const trigger=Button("Abrir evidência",true); const drawer=el("div",{className:"drawer",hidden:true,role:"dialog",ariaModal:"true",ariaLabel:"Evidência técnica"}); const close=Button("Fechar evidência",true); const panel=el("aside",{className:"drawer__panel"},[el("div",{className:"drawer__header"},[el("h2",{text:"Evidência técnica"}),close]),el("p",{text:"Escopo: case_synthetic · execução local"}),SourceLine("Case/technical-validation/2026-09-21-064413/")]);drawer.append(panel);let previous; const shut=()=>{drawer.hidden=true;previous?.focus();};trigger.addEventListener("click",()=>{previous=trigger;drawer.hidden=false;close.focus();});close.addEventListener("click",shut);drawer.addEventListener("keydown",event=>{if(event.key==="Escape")shut();if(event.key==="Tab"){event.preventDefault();close.focus();}}); document.body.append(drawer); return trigger; }

const primitiveNames=["Button","Badge","Card","Table","Accordion","Tabs","Drawer","Source line"];
const domain=[
  ["Case Status Banner","Case local, privado e sem ações externas","yellow"],
  ["Fit Score Card","Critérios propostos; premissas a validar","pink"],
  ["Brand Opportunity Card","Pesquisa pública · oportunidade não confirmada","pink"],
  ["Pipeline Stage","Simulation Designed · sem promoção para produção","blue"],
  ["Workflow Step","Expected = observed · simulador local","olive"],
  ["Approval Gate","Governance blocked · nenhum envio permitido","yellow"],
  ["Handoff Card","Brand Partnerships → CRM Operations","blue"],
  ["Synthetic KPI Card","5 aceitos · 7 em quarentena","blue"],
  ["Data Quality Issue","Q08 · duplicata em quarentena","yellow"],
  ["Evidence Card","Fonte, escopo, execução e integridade","olive"],
  ["QA Status Card","QA-004 · aberta · baixa","yellow"],
  ["Reconciliation Block","SQL = Python = amostra manual","olive"],
  ["SOP Step","Owner, entrada, controle e evidência","blue"],
  ["Source Lineage Block","Artefato → evidência → afirmação","pink"]
];

const domainFields = {
  "Case Status Banner":["escopo","execução","governança"], "Fit Score Card":["critério","peso","faixa"], "Brand Opportunity Card":["fonte pública","fit","estado"],
  "Pipeline Stage":["entrada","saída","owner"], "Workflow Step":["expected","observed","status"], "Approval Gate":["decisão","escopo","expiração"],
  "Handoff Card":["origem","destino","manifesto"], "Synthetic KPI Card":["valor","scope","sourceRef"], "Data Quality Issue":["código","severidade","tratamento"],
  "Evidence Card":["fonte","hash","validação"], "QA Status Card":["issue","estado","condição"], "Reconciliation Block":["SQL","Python","amostra"],
  "SOP Step":["owner","controle","saída"], "Source Lineage Block":["artefato","evidência","afirmação"]
};

export function renderComponentCatalog(primitiveRoot, domainRoot) {
  primitiveRoot.replaceChildren(); domainRoot.replaceChildren();
  primitiveNames.forEach(name=>{const card=Card(name,`Estado padrão e foco visível de ${name}.`);card.dataset.component=name;
    if(name==="Button")card.append(Button("Ação interna"));
    if(name==="Badge")card.append(Badge("documentado","blue"));
    if(name==="Card")card.append(SourceLine("artefato/canônico.md"));
    if(name==="Table"){const table=el("table",{},[el("caption",{text:"Exemplo acessível"}),el("tbody",{},el("tr",{},[el("th",{text:"Estado"}),el("td",{text:"Documentado"})]))]);card.append(el("div",{className:"table-wrap"},table));}
    if(name==="Accordion")card.append(Disclosure());if(name==="Tabs")card.append(Tabs());if(name==="Drawer")card.append(EvidenceDrawer());if(name==="Source line")card.append(SourceLine("source-map.json"));primitiveRoot.append(card);});
  domain.forEach(([name,body,tone])=>{let card=name==="Synthetic KPI Card"?SyntheticKpiCard({label:name,value:"5 / 12",sourceRef:"import_dry_run_results.json"}):Card(name,body,tone);card.dataset.component=name;const fields=el("dl");for(const field of domainFields[name])fields.append(el("div",{"data-field":"true"},[el("dt",{text:field}),el("dd",{text:"Exemplo documentado"})]));card.append(fields);if(name==="Approval Gate")card.append(Badge("ação externa bloqueada","blocked"));else card.append(Badge(name.includes("QA")?"limitação":"documentado",tone==="olive"?"olive":"blue"));domainRoot.append(card);});
}
