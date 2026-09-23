import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("case page explains the problem, analysis, solution and provenance", async () => {
  const page = await readFile(new URL("../src/pages/pipeline-health.astro", import.meta.url), "utf8");

  for (const marker of [
    "O problema",
    "O que os dados revelaram",
    "Dashboard explorável",
    "Como CRM e automação entram",
    "SQL + Python",
    "Limitações",
    "/pipeline-health/data/dashboard.json",
  ]) {
    assert.match(page, new RegExp(marker.replace(/[+]/g, "\\+")));
  }
});

test("homepage links to the new case", async () => {
  const cases = await readFile(new URL("../src/data/cases.js", import.meta.url), "utf8");
  assert.match(cases, /href:\s*["']\/pipeline-health["']/);
});

test("dashboard payload is reconciled with the analysis", async () => {
  const raw = await readFile(new URL("../public/pipeline-health/data/dashboard.json", import.meta.url), "utf8");
  const dashboard = JSON.parse(raw);

  assert.equal(dashboard.kpis.source_opportunities, 8800);
  assert.equal(dashboard.kpis.engaging_deals, 1589);
  assert.equal(dashboard.kpis.engaging_90_plus, 1479);
  assert.equal(dashboard.priority_queue.length, 1589);
});

test("standalone dashboard preserves the validated data experience", async () => {
  const page = await readFile(new URL("../src/pages/pipeline-health/dashboard.astro", import.meta.url), "utf8");
  const casePage = await readFile(new URL("../src/pages/pipeline-health.astro", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles/pipeline-dashboard.css", import.meta.url), "utf8");

  for (const marker of [
    "/pipeline-health/data/dashboard.json",
    "12/08/2026",
    "filter-region",
    "monthly-chart",
    "queue-table",
  ]) assert.match(page, new RegExp(marker.replace(/[+]/g, "\\+")));

  assert.match(casePage, /href=["']\/pipeline-health\/dashboard["']/);
  assert.match(casePage, /12\/08\/2026/);
  assert.match(styles, /--dash-ink:\s*#101b3f/i);
  assert.match(styles, /--dash-lime:\s*#dfff5f/i);
  assert.match(styles, /--dash-magenta:\s*#e83e8c/i);
});
