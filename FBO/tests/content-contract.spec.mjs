import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { buildCaseData } from "../scripts/build-content.mjs";
import { validateCaseData } from "../scripts/validate-content.mjs";

const projectRoot = fileURLToPath(new URL("../../..", import.meta.url));

test("builds every required FBO section from approved sources", async () => {
  const data = await buildCaseData(projectRoot);
  assert.equal(data.identity.name, "FBO — From Brief to Ops");
  assert.equal(data.identity.subtitle, "Creator Partnerships, CRM & Marketing Operations");
  assert.deepEqual(Object.keys(data.sections), [
    "context", "brandPartnerships", "handoff", "crmArchitecture",
    "lifecycle", "workflows", "dataQuality", "analytics",
    "dashboard", "qa", "limitations", "evidence"
  ]);
  assert.deepEqual(data.metrics, {
    workflowScenarios: { passed: 27, total: 27 },
    automatedTests: { passed: 11, total: 11 },
    reconciledQueries: { passed: 6, total: 6 },
    syntheticRecords: { accepted: 5, quarantined: 7, total: 12 },
    rollback: [0, 5, 0],
    externalActions: 0,
    externalWrites: 0
  });
  assert.equal(data.qa.find(issue => issue.id === "QA-004").status, "open");
  assert.equal(validateCaseData(data).ok, true);
});

test("rejects unsupported external execution claims", async () => {
  const data = await buildCaseData(projectRoot);
  data.sections.context.executive = "Outreach realizado para marcas reais";
  const result = validateCaseData(data);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /proibida/i);
});

test("maps every section to existing canonical sources", async () => {
  const data = await buildCaseData(projectRoot);
  for (const section of Object.values(data.sections)) {
    assert.ok(section.sourceRefs.length > 0);
    assert.ok(section.sourceRefs.every(source => data.sourceInventory.includes(source)));
  }
});

test("rejects incomplete or altered validated metrics", async () => {
  const mutations = [
    data => { data.metrics.syntheticRecords.accepted = 999; },
    data => { delete data.scope; },
    data => { delete data.metrics.rollback; },
    data => { data.sections.context.executive = "Conquistamos 100 clientes e R$ 100000 em vendas reais"; }
  ];
  for (const mutate of mutations) {
    const data = await buildCaseData(projectRoot);
    mutate(data);
    assert.equal(validateCaseData(data).ok, false);
  }
});

test("preserves canonical quarantine meanings", async () => {
  const data = await buildCaseData(projectRoot);
  assert.equal(data.quarantineReasons.Q06.label, "financeiro sintético inválido");
  assert.equal(data.quarantineReasons.Q12.label, "owner ausente ou inativo");
});
