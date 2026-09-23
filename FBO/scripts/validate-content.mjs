import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const prohibited = [
  /outreach\s+(realizado|enviado)/i,
  /crm\s+(atualizado|importado)/i,
  /workflow\s+(ativado|em produção)/i,
  /receita\s+(gerada|realizada)/i,
  /publicado\s+externamente/i
  ,/\b(conquistamos?|geramos?)\b.*\b(clientes?|vendas?|receita)\b/i
  ,/\b(vendas?|receita)\s+reais?\b/i
];

export function validateCaseData(data) {
  const errors = [];
  const serialized = JSON.stringify(data);
  for (const pattern of prohibited) {
    if (pattern.test(serialized)) errors.push(`Afirmação proibida detectada: ${pattern}`);
  }
  const required = ["context", "brandPartnerships", "handoff", "crmArchitecture", "lifecycle", "workflows", "dataQuality", "analytics", "dashboard", "qa", "limitations", "evidence"];
  if (JSON.stringify(Object.keys(data.sections ?? {})) !== JSON.stringify(required)) errors.push("Seções obrigatórias ausentes ou fora de ordem");
  if (data.identity?.name !== "FBO — From Brief to Ops") errors.push("Naming divergente");
  if (data.identity?.subtitle !== "Creator Partnerships, CRM & Marketing Operations") errors.push("Subtítulo divergente");
  if (data.scope !== "case_synthetic" || data.execution !== "local") errors.push("Escopo/execução inválidos");
  const expectedMetrics = {
    workflowScenarios: { passed:27, total:27 }, automatedTests:{ passed:11, total:11 },
    reconciledQueries:{ passed:6, total:6 }, syntheticRecords:{ accepted:5, quarantined:7, total:12 },
    rollback:[0,5,0], externalActions:0, externalWrites:0
  };
  if (JSON.stringify(data.metrics) !== JSON.stringify(expectedMetrics)) errors.push("Métricas validadas divergentes ou incompletas");
  if (data.metrics?.externalActions !== 0 || data.metrics?.externalWrites !== 0) errors.push("Ação externa diferente de zero");
  if (data.metrics?.syntheticRecords?.accepted + data.metrics?.syntheticRecords?.quarantined !== data.metrics?.syntheticRecords?.total) errors.push("Reconciliação de registros inválida");
  if (data.qa?.find(item => item.id === "QA-004")?.status !== "open") errors.push("QA-004 deve permanecer aberta");
  for (const [key, section] of Object.entries(data.sections ?? {})) {
    if (!Array.isArray(section.sourceRefs) || section.sourceRefs.length === 0) errors.push(`${key} sem proveniência`);
    if (!section.sourceRefs?.every(ref => data.sourceInventory?.includes(ref))) errors.push(`${key} referencia fonte fora do inventário`);
  }
  if (!Array.isArray(data.claims) || data.claims.length < 5) errors.push("Claims observados ausentes");
  for (const claim of data.claims ?? []) {
    if (claim.scope !== "case_synthetic" || claim.execution !== "local" || !data.sourceInventory?.includes(claim.sourceRef)) errors.push(`Claim ${claim.id} sem escopo ou fonte válida`);
  }
  const expectedReasons = { Q06:"financeiro sintético inválido", Q12:"owner ausente ou inativo" };
  for (const [code,label] of Object.entries(expectedReasons)) if (data.quarantineReasons?.[code]?.label !== label) errors.push(`${code} divergente`);
  if (!data.evidence?.workflow?.results || data.evidence.workflow.results.length !== 27) errors.push("Evidência de workflow incompleta");
  if (data.evidence?.reconciliation?.reconciliation?.filter(item => item.status === "PASS").length !== 6) errors.push("Reconciliação incompleta");
  return { ok: errors.length === 0, errors };
}

const here = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const path = join(here, "..", "src", "data", "generated-case-data.json");
  const result = validateCaseData(JSON.parse(await readFile(path, "utf8")));
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("content validation: PASS");
  }
}
