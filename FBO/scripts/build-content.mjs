import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateCaseData } from "./validate-content.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(here, "..", "..", "..");
const run = "Case/technical-validation/2026-09-21-064413";

async function json(root, path) {
  return JSON.parse(await readFile(join(root, path), "utf8"));
}

async function text(root, path) {
  return readFile(join(root, path), "utf8");
}

function section(title, executive, sourceRefs, details = []) {
  return { title, executive, sourceRefs, details };
}

export async function buildCaseData(projectRoot = defaultRoot) {
  const sourceMap = await json(projectRoot, "Case/fbo/src/data/source-map.json");
  const sourceInventory = [...new Set(Object.values(sourceMap).flat())];
  await Promise.all(sourceInventory.map(path => readFile(join(projectRoot, path))));

  const [workflow, dryRun, rollback, sql, python, reconciliation, qaText] = await Promise.all([
    json(projectRoot, `${run}/evidence/workflow_test_results.json`),
    json(projectRoot, `${run}/evidence/import_dry_run_results.json`),
    json(projectRoot, `${run}/evidence/rollback_evidence.json`),
    json(projectRoot, `${run}/evidence/sql_query_results.json`),
    json(projectRoot, `${run}/evidence/python_analysis_results.json`),
    json(projectRoot, `${run}/evidence/analytics_reconciliation.json`),
    text(projectRoot, "artifacts/final-outputs/qa-signoff.md")
  ]);

  if (!/11\/11 PASS/.test(qaText)) throw new Error("QA sign-off não confirma 11/11 testes");
  const hashes = Object.fromEntries([...qaText.matchAll(/\|\s*([^|`]+?)\s*\|\s*`([A-F0-9]{64})`\s*\|/g)].map(match => [match[1].trim(), match[2]]));
  const qa = [
    { id: "QA-001", status: /QA-001.*Fechada no escopo local\/sintético/i.test(qaText) ? "closed_local_synthetic" : "unknown", severity: "resolved", summary: "Workflows validados em simulador local." },
    { id: "QA-002", status: /QA-002.*Fechada no escopo local\/sintético/i.test(qaText) ? "closed_local_synthetic" : "unknown", severity: "resolved", summary: "Dry-run e rollback validados localmente." },
    { id: "QA-003", status: /QA-003.*Fechada no escopo local\/sintético/i.test(qaText) ? "closed_local_synthetic" : "unknown", severity: "resolved", summary: "SQL, Python, amostra manual e dashboard reconciliados." },
    { id: "QA-004", status: /QA-004.*Aberta/i.test(qaText) ? "open" : "unknown", severity: /QA-004.*baixa/i.test(qaText) ? "low" : "unknown", summary: "Qualificação comercial real exige contatos e evidência fora do escopo." }
  ];

  const sections = {
    context: section("Contexto e problema", "Transformar um briefing fictício e uma operação comercial fragmentada em um sistema auditável, sem representar hipóteses como resultados reais.", sourceMap.context, ["Marina Costa é uma persona fictícia.", "Metas, audiência, receita e histórico do briefing são premissas do case.", "Dois squads e seis profissionais cobrem partnerships, CRM, analytics, documentação e QA."]),
    brandPartnerships: section("Brand Partnerships", "ICP, fit, pesquisa pública, copy e simulações estruturam a frente comercial sem contato real.", sourceMap.brandPartnerships, ["Pesquisa pública: marcas reais, sem oportunidade comercial confirmada.", "Outreach: playbook interno e simulação; zero mensagens enviadas.", "Negociação e pipeline: cenários sintéticos, não resultados comerciais."]),
    handoff: section("Handoff", "Um manifesto versionado transfere requisitos e evidências de Brand Partnerships para CRM Operations.", sourceMap.handoff, ["Origem: brand-partnerships.", "Destino: crm-operations.", "Artefatos permanecem rastreáveis por caminho e integridade documental."]),
    crmArchitecture: section("CRM Architecture", "Modelo lógico de objetos, associações, Approval Gates e Evidence, projetado sem configuração em CRM real.", sourceMap.crmArchitecture, ["102 propriedades documentadas.", "Escopos case_synthetic e production_real são isolados.", "Nenhuma escrita externa foi realizada."]),
    lifecycle: section("Lifecycle e SLAs", "Lifecycles de Company/Contact e stages de oportunidade têm critérios, owner, SLA, evidência e transições bloqueadas.", sourceMap.lifecycle, ["Company e Contact não são confundidos com Deal stage.", "Transições exigem evidência e não promovem dados sintéticos."]),
    workflows: section("Workflows", `${workflow.passed}/${workflow.total} cenários passaram no simulador local determinístico.`, sourceMap.workflows, workflow.results),
    dataQuality: section("Data quality", `${dryRun.accepted_local_only} registros aceitos localmente e ${dryRun.quarantined} em quarentena, sobre ${dryRun.input_records} sintéticos.`, sourceMap.dataQuality, [dryRun, rollback]),
    analytics: section("SQL e Python", `${reconciliation.queries_executed}/6 queries reconciliadas entre SQL, Python e amostra manual.`, sourceMap.analytics, [{ sql, python, reconciliation }]),
    dashboard: section("Dashboard", "Dashboard funcional exclusivamente sintético, com filtros, qualidade e empty state.", sourceMap.dashboard, ["DADOS SINTÉTICOS — VALIDAÇÃO LOCAL", "Não publicado e sem telemetria externa."]),
    qa: section("QA", "QA-001, QA-002 e QA-003 fechadas somente no escopo local/sintético; QA-004 permanece aberta.", sourceMap.qa, qa),
    limitations: section("Limitações", "O case comprova desenho e execução local; não comprova performance comercial nem implementação em ambiente real.", sourceMap.limitations, ["Sem qualificação comercial real.", "Sem outreach ou negociação real.", "Sem CRM ou workflows em produção.", "Sem receita, conversão ou interesse real.", "Sem publicação externa."]),
    evidence: section("Evidências", "Cada afirmação tem origem, escopo e estado operacional visíveis.", sourceMap.evidence, sourceInventory)
  };

  const data = {
    identity: { name: "FBO — From Brief to Ops", subtitle: "Creator Partnerships, CRM & Marketing Operations" },
    generatedAt: "2026-09-23",
    runId: workflow.run_id,
    scope: "case_synthetic",
    execution: "local",
    sections,
    sourceInventory,
    metrics: {
      workflowScenarios: { passed: workflow.passed, total: workflow.total },
      automatedTests: { passed: 11, total: 11 },
      reconciledQueries: { passed: reconciliation.reconciliation.filter(item => item.status === "PASS").length, total: reconciliation.queries_executed },
      syntheticRecords: { accepted: dryRun.accepted_local_only, quarantined: dryRun.quarantined, total: dryRun.input_records },
      rollback: [rollback.snapshot_before.row_count, rollback.during_transaction.row_count, rollback.after_rollback.row_count],
      externalActions: workflow.external_actions,
      externalWrites: Math.max(dryRun.external_writes, rollback.external_writes, reconciliation.external_writes)
    },
    quarantineReasons: {
      Q02: { label: "identidade ausente", occurrences: dryRun.reason_code_counts.Q02 },
      Q05: { label: "gate, campo ou evidência de stage ausente", occurrences: dryRun.reason_code_counts.Q05 },
      Q06: { label: "financeiro sintético inválido", occurrences: dryRun.reason_code_counts.Q06 },
      Q08: { label: "duplicidade", occurrences: dryRun.reason_code_counts.Q08 },
      Q10: { label: "opt-out conflitante ou incompleto", occurrences: dryRun.reason_code_counts.Q10 },
      Q12: { label: "owner ausente ou inativo", occurrences: dryRun.reason_code_counts.Q12 }
    },
    claims: [
      { id:"workflow-pass", value:`${workflow.passed}/${workflow.total}`, scope:"case_synthetic", execution:"local", sourceRef:`${run}/evidence/workflow_test_results.json` },
      { id:"records", value:dryRun.input_records, scope:"case_synthetic", execution:"local", sourceRef:`${run}/evidence/import_dry_run_results.json` },
      { id:"accepted", value:dryRun.accepted_local_only, scope:"case_synthetic", execution:"local", sourceRef:`${run}/evidence/import_dry_run_results.json` },
      { id:"quarantined", value:dryRun.quarantined, scope:"case_synthetic", execution:"local", sourceRef:`${run}/evidence/import_dry_run_results.json` },
      { id:"queries", value:reconciliation.queries_executed, scope:"case_synthetic", execution:"local", sourceRef:`${run}/evidence/analytics_reconciliation.json` }
    ],
    qa,
    evidence: { workflow, dryRun, rollback, sql, python, reconciliation }
    ,hashes
  };
  const validation = validateCaseData(data);
  if (!validation.ok) throw new Error(`Conteúdo gerado inválido:\n${validation.errors.join("\n")}`);
  return data;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const data = await buildCaseData(defaultRoot);
  await writeFile(join(defaultRoot, "Case/fbo/src/data/generated-case-data.json"), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("generated Case/fbo/src/data/generated-case-data.json");
}
