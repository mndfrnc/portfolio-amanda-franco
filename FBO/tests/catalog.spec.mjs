import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));

test("catalog exposes approved identity and semantic foundation", async () => {
  const [html, tokens, base] = await Promise.all([
    readFile(join(root, "design-system.html"), "utf8"),
    readFile(join(root, "src/styles/tokens.css"), "utf8"),
    readFile(join(root, "src/styles/base.css"), "utf8")
  ]);
  assert.match(html, /<h1[^>]*>FBO — From Brief to Ops<\/h1>/);
  assert.match(html, /Creator Partnerships, CRM &amp; Marketing Operations/);
  assert.equal((html.match(/data-catalog-nav/g) ?? []).length, 10);
  assert.match(html, /class="skip-link"/);
  assert.match(tokens, /--color-cream:\s*#F6EFDF/);
  assert.match(tokens, /--color-ink:\s*#121210/);
  assert.match(base, /:focus-visible/);
  assert.doesNotMatch(html + tokens + base, /https?:\/\//);
});

test("catalog uses local accessible icon symbols", async () => {
  const icons = await readFile(join(root, "assets/icons.svg"), "utf8");
  for (const id of ["navigation", "evidence", "workflow", "database", "code", "qa", "warning", "success", "close", "expand", "filter", "blocked"]) {
    assert.match(icons, new RegExp(`id="icon-${id}"`));
  }
});
