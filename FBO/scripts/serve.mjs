import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
const root = normalize(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".mjs":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://local").pathname);
    let path = normalize(join(root, pathname === "/" ? "index.html" : pathname));
    if (!path.startsWith(root)) throw new Error("traversal denied");
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream", "Cache-Control":"no-store" });
    res.end(await readFile(path));
  } catch { res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"}); res.end("Não encontrado"); }
}).listen(port, "127.0.0.1", () => console.log(`FBO local: http://127.0.0.1:${port}`));
