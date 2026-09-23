import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
async function walk(dir) { const out=[]; for (const e of await readdir(dir,{withFileTypes:true})) { const p=join(dir,e.name); if(e.isDirectory()){ if(relative(root,p).replaceAll("\\","/")==="evidence/screenshots") continue; out.push(...await walk(p)); } else if(!p.endsWith("checkpoint-sha256.json")) out.push(p); } return out; }
const manifest={ generatedAt:new Date().toISOString(), algorithm:"SHA-256", files:{} };
for (const path of (await walk(root)).sort()) manifest.files[relative(root,path).replaceAll("\\","/")]=createHash("sha256").update(await readFile(path)).digest("hex").toUpperCase();
const target=join(root,"evidence","checkpoint-sha256.json"); await mkdir(dirname(target),{recursive:true}); await writeFile(target,`${JSON.stringify(manifest,null,2)}\n`); console.log(`checkpoint: ${Object.keys(manifest.files).length} files`);
