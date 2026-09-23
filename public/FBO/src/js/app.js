import { initEvidenceDrawer, initViewModes } from "./interactions.js";
import { SourceLine } from "./components.js";
document.documentElement.dataset.contentState="loading";

const expected = {
  workflowScenarios:{ passed:27,total:27 }, automatedTests:{ passed:11,total:11 },
  reconciledQueries:{ passed:6,total:6 }, syntheticRecords:{ accepted:5,quarantined:7,total:12 },
  rollback:[0,5,0], externalActions:0, externalWrites:0
};

function assertBrowserContract(data) {
  if (data?.identity?.name !== "FBO — From Brief to Ops") throw new Error("naming inválido");
  if (data?.scope !== "case_synthetic" || data?.execution !== "local") throw new Error("escopo inválido");
  if (JSON.stringify(data.metrics) !== JSON.stringify(expected)) throw new Error("métricas inválidas");
  if (data.qa?.find(item => item.id === "QA-004")?.status !== "open") throw new Error("QA-004 inválida");
  if (data.evidence?.workflow?.results?.length !== 27) throw new Error("workflows incompletos");
  if (data.evidence?.reconciliation?.reconciliation?.length !== 6) throw new Error("reconciliação incompleta");
}

function text(selector, value) { const node=document.querySelector(selector); if(node) node.textContent=value; }

function renderObservedEvidence(data) {
  text("#workflows .metric", `${data.metrics.workflowScenarios.passed}/${data.metrics.workflowScenarios.total} PASS`);
  const quality=[`${data.metrics.syntheticRecords.total} registros`,`${data.metrics.syntheticRecords.accepted} aceitos`,`${data.metrics.syntheticRecords.quarantined} em quarentena`,`${data.evidence.dryRun.mapped_fields}/${data.evidence.dryRun.mapped_fields}`];
  document.querySelectorAll("#data-quality .kpi-card .metric").forEach((node,index)=>node.textContent=quality[index]);
  text("#data-quality .editorial-grid .metric", data.metrics.rollback.join(" → "));
  text("#sql-python .card[data-tone='olive'] .metric", `${data.metrics.reconciledQueries.passed}/${data.metrics.reconciledQueries.total} idênticas`);
  const dashboard=[data.metrics.syntheticRecords.accepted,data.metrics.syntheticRecords.quarantined,data.evidence.dryRun.sla_overdue_accepted,data.metrics.externalActions];
  document.querySelectorAll("#dashboard .kpi-card .metric").forEach((node,index)=>node.textContent=dashboard[index]);

  const rows=[...document.querySelectorAll("#data-quality tbody tr")];
  Object.entries(data.quarantineReasons).forEach(([code,reason],index)=>{if(rows[index]){rows[index].children[0].textContent=`${code} ${reason.label}`;rows[index].children[1].textContent=reason.occurrences;rows[index].children[2].textContent="quarentena · revisão controlada";}});

  const workflowBody=document.createElement("tbody"); workflowBody.dataset.workflowEvidence="";
  for(const item of data.evidence.workflow.results){const row=document.createElement("tr");for(const value of [item.test_id,`WF-${String(item.workflow_id).padStart(2,"0")}`,item.category,item.expected,item.observed,item.status]){const cell=document.createElement("td");cell.textContent=value;row.append(cell);}workflowBody.append(row);}
  const workflowTable=document.createElement("table");workflowTable.append(workflowBody);const workflowWrap=document.createElement("div");workflowWrap.className="table-wrap";workflowWrap.append(workflowTable);document.querySelector("#workflows .evidence-details__body")?.append(workflowWrap);

  const queryEvidence=document.createElement("div");queryEvidence.dataset.queryEvidence="";queryEvidence.className="query-grid";
  for(const result of data.evidence.reconciliation.reconciliation){const article=document.createElement("article");article.className="card";const title=document.createElement("h3");title.textContent=`${result.query_id} · ${result.status}`;const pre=document.createElement("pre");pre.textContent=JSON.stringify(data.evidence.sql[result.query_id],null,2);article.append(title,pre);queryEvidence.append(article);}
  document.querySelector("#sql-python .evidence-details__body")?.append(queryEvidence);

  const hashList=document.createElement("div");hashList.className="hash-list";
  const sharedSource=SourceLine("Case/fbo/src/data/source-map.json");sharedSource.dataset.sharedComponent="SourceLine";hashList.append(sharedSource);
  for(const [name,hash] of Object.entries(data.hashes)){const line=document.createElement("p");line.className="source-line";const strong=document.createElement("strong");strong.textContent=name;const br=document.createElement("br");const code=document.createElement("code");code.dataset.evidenceHash="";code.textContent=hash;line.append(strong,br,code);hashList.append(line);}
  document.querySelector("#evidencias .evidence-details__body")?.append(hashList);
}

function initFilters() {
  const filters=[...document.querySelectorAll("[data-filter-stage], [data-filter-owner], [data-filter-status], [data-filter-severity]")];
  const rows=[...document.querySelectorAll("[data-dashboard-row]")]; const empty=document.querySelector("[data-dashboard-empty]"); const live=document.querySelector("[data-live-region]");
  const apply=()=>{const values=Object.fromEntries(filters.map(filter=>[filter.dataset.filterStage!==undefined?"stage":filter.dataset.filterOwner!==undefined?"owner":filter.dataset.filterStatus!==undefined?"status":"severity",filter.value]));let visible=0;rows.forEach(row=>{const show=Object.entries(values).every(([key,value])=>value==="all"||row.dataset[key]===value);row.hidden=!show;if(show)visible++;});if(empty)empty.hidden=visible!==0;if(live)live.textContent=`${visible} registros visíveis`;};
  filters.forEach(filter=>filter.addEventListener("change",apply));
}

function initCopy() { const button=document.querySelector("[data-copy-query]");button?.addEventListener("click",async()=>{await navigator.clipboard.writeText(document.querySelector("[data-query-code]")?.textContent??"");button.textContent="Copiado";window.setTimeout(()=>button.textContent="Copiar SQL",1800);}); }

async function main() {
  try {
    const response=await fetch("/FBO/src/data/generated-case-data.json",{cache:"no-store"}); if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const data=await response.json(); assertBrowserContract(data); renderObservedEvidence(data);
    document.documentElement.dataset.scope=data.scope;document.documentElement.dataset.execution=data.execution;document.documentElement.dataset.contentState="ready";
    document.querySelectorAll("details[data-evidence]").forEach(details=>details.addEventListener("toggle",()=>details.dataset.state=details.open?"open":"closed"));
    initCopy();initFilters();initViewModes();initEvidenceDrawer(data);
  } catch(error) {
    document.documentElement.dataset.contentState="error";
    const alert=document.createElement("div");alert.className="content-error";alert.setAttribute("role","alert");alert.innerHTML="<strong>Evidência indisponível.</strong> Os resultados observados foram ocultados porque o contrato de conteúdo não pôde ser validado.";
    document.querySelector("main")?.prepend(alert);console.error(error);
  }
}
main();
