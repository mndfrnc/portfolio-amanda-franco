import { test, expect } from "playwright/test";
const baseURL = process.env.FBO_BASE_URL || "http://127.0.0.1:4173";

test("case opens with corrected FBO identity and governance status", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  await expect(page.locator("h1")).toHaveText("FBO — From Brief to Ops");
  await expect(page.getByText("Creator Partnerships, CRM & Marketing Operations")).toBeVisible();
  await expect(page.getByText("CASE LOCAL · PRIVADO · SEM AÇÕES EXTERNAS")).toBeVisible();
});

test("context, partnerships and handoff preserve provenance boundaries", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  for (const id of ["contexto", "brand-partnerships", "handoff"]) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.getByText(/Marina Costa é uma persona fictícia/i)).toBeVisible();
  await expect(page.getByText(/Pesquisa pública.*oportunidade não confirmada/i)).toBeVisible();
  await expect(page.getByText(/Outreach.*não executado/i)).toBeVisible();
  await expect(page.locator("#handoff").getByText(/brand-partnerships/i)).toBeVisible();
  await expect(page.locator("#handoff").getByText(/crm-operations/i)).toBeVisible();
  await page.locator("#handoff summary").click();
  await expect(page.locator("#handoff").getByText(/handoff-manifest\.md/i)).toBeVisible();
});

test("every first-phase section has expandable technical evidence", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  for (const id of ["contexto", "brand-partnerships", "handoff"]) {
    await expect(page.locator(`#${id} details[data-evidence]`)).toHaveCount(1);
  }
});

test("CRM architecture, lifecycle and workflows show validated controls", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  for (const id of ["crm-architecture", "lifecycle-slas", "workflows"]) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator("#crm-architecture")).toContainText("102 propriedades");
  await expect(page.locator("#crm-architecture")).toContainText("Brand");
  await expect(page.locator("#crm-architecture")).toContainText("Person");
  await expect(page.locator("#crm-architecture")).toContainText("Opportunity");
  await expect(page.locator("#crm-architecture")).toContainText("Approval Gate");
  await expect(page.locator("#crm-architecture")).toContainText("Evidence");
  await expect(page.locator("#lifecycle-slas")).toContainText("Company / Contact lifecycle");
  await expect(page.locator("#lifecycle-slas")).toContainText("Opportunity stages");
  await expect(page.locator("[data-workflow-card]")).toHaveCount(8);
  await expect(page.locator("#workflows")).toContainText("27/27 PASS");
  await expect(page.locator("#workflows")).toContainText("WF-08");
  await expect(page.locator("#workflows")).toContainText("4/4 bloqueados");
  await expect(page.getByRole("button", { name: /ativar workflow/i })).toHaveCount(0);
});

test("data quality and SQL/Python expose reconciled synthetic evidence", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  await expect(page.locator("#data-quality")).toContainText("12 registros");
  await expect(page.locator("#data-quality")).toContainText("5 aceitos");
  await expect(page.locator("#data-quality")).toContainText("7 em quarentena");
  for (const code of ["Q02", "Q05", "Q06", "Q08", "Q10", "Q12"]) await expect(page.locator("#data-quality")).toContainText(code);
  await expect(page.locator("#data-quality")).toContainText("CASE-006");
  await expect(page.locator("#data-quality")).toContainText("0 → 5 → 0");
  await expect(page.locator("[data-query]")).toHaveCount(6);
  await expect(page.locator("[data-reconciliation='pass']")).toHaveCount(6);
  await expect(page.locator("#sql-python")).toContainText("Amostra manual: PASS");
  await expect(page.locator("#dashboard")).toContainText("DADOS SINTÉTICOS — VALIDAÇÃO LOCAL");
  await expect(page.locator("#dashboard")).toContainText("Zero escritas externas");
  await expect(page.locator("#data-quality")).toContainText("Q06 financeiro sintético inválido");
  await expect(page.locator("#data-quality")).toContainText("Q12 owner ausente ou inativo");
});

test("synthetic dashboard filters and preserves an explicit empty state", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  await expect(page.locator("[data-dashboard-row]:visible")).toHaveCount(5);
  await page.locator("[data-filter-severity]").selectOption("critical");
  await expect(page.locator("[data-dashboard-empty]")).toBeVisible();
  await expect(page.locator("[data-dashboard-empty]")).toContainText("Nenhum registro sintético corresponde aos filtros ativos");
});

test("SQL copy action provides visible feedback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`${baseURL}/`);
  await page.locator("[data-copy-query]").first().click();
  await expect(page.locator("[data-copy-query]").first()).toHaveText("Copiado");
});

test("QA and limitations preserve exact local scope", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  for (const id of ["qa", "limitacoes", "evidencias"]) await expect(page.locator(`#${id}`)).toBeVisible();
  for (const id of ["QA-001", "QA-002", "QA-003"]) await expect(page.locator("#qa")).toContainText(`${id} · fechada no escopo local/sintético`);
  await expect(page.locator("#qa")).toContainText("QA-004 · aberta · baixa");
  await expect(page.locator("#limitacoes")).toContainText("Sem qualificação comercial real");
  await expect(page.locator("#limitacoes")).toContainText("Sem publicação externa");
});

test("executive and technical views share claims and preserve navigation", async ({ page }) => {
  await page.goto(`${baseURL}/#workflows`);
  await expect(page.locator("html")).toHaveAttribute("data-view", "executive");
  await expect(page.locator("#limitacoes")).toBeVisible();
  await page.getByRole("button", { name: "Visão técnica" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-view", "technical");
  await expect(page).toHaveURL(/#workflows$/);
  await expect(page.locator("#limitacoes")).toBeVisible();
  await expect(page.locator("details[data-evidence][open]")).toHaveCount(12);
  await expect(page.locator("[data-workflow-evidence] tr")).toHaveCount(27);
  await expect(page.locator("[data-query-evidence] article")).toHaveCount(6);
  await expect(page.locator("[data-evidence-hash]").first()).not.toHaveText("");
  await expect(page.locator("#evidencias [data-shared-component='SourceLine']")).toBeVisible();
});

test("missing generated evidence blocks observed claims visibly", async ({ page }) => {
  await page.route("**/generated-case-data.json", route => route.fulfill({ status:404, body:"missing" }));
  await page.goto(`${baseURL}/`);
  await expect(page.getByRole("alert")).toContainText("Evidência indisponível");
  await expect(page.getByText("27/27 PASS", { exact:true })).toBeHidden();
});
