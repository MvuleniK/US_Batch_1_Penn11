#!/usr/bin/env node
// Deploy the static site to Cloudflare as a Worker that embeds the files, the same
// pattern as the other *-poc previews, and attach a Workers Custom Domain.
//
//   CLOUDFLARE_API_TOKEN=... node deploy/cloudflare.mjs        # deploy
//   node deploy/cloudflare.mjs --dry                           # list the files only
//
// The token needs: Workers Scripts:Edit (account) and Workers Routes/DNS:Edit (zone).
// Override CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_ZONE_ID / PGE_WORKER_NAME / PGE_HOSTNAME if needed.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || "2f2f717783e292f1e000871e3a81ab8c";
const ZONE = process.env.CLOUDFLARE_ZONE_ID || "6bfaed5935a546aac38103a88739cb2a";
const NAME = process.env.PGE_WORKER_NAME || "pgecomfort-poc";
const HOST = process.env.PGE_HOSTNAME || "pgecomfort.oculeusltd.com";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUTH = process.env.CLOUDFLARE_API_TOKEN ? { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` } : {};
const API = "https://api.cloudflare.com/client/v4";
const DRY = process.argv.includes("--dry");

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".txt": "text/plain" };
const PAGES = ["index.html", "services.html", "service-areas.html", "reviews.html", "schedule-service.html", "robots.txt"];

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const files = [...PAGES.map((f) => join(ROOT, f)), ...walk(join(ROOT, "assets"))];

const manifest = {};
const byHash = {};
for (const f of files) {
  const buf = readFileSync(f);
  const b64 = buf.toString("base64");
  const ext = extname(f).slice(1);
  const hash = createHash("sha256").update(b64 + ext).digest("hex").slice(0, 32);
  const path = "/" + relative(ROOT, f).split("\\").join("/");
  manifest[path] = { hash, size: buf.length };
  byHash[hash] = { b64, type: TYPES[extname(f)] || "application/octet-stream", path };
}
console.log(`${files.length} files, ${(Object.values(manifest).reduce((a, m) => a + m.size, 0) / 1024).toFixed(0)} KB`);
if (DRY) { console.log(Object.keys(manifest).join("\n")); process.exit(0); }

async function api(method, url, body, headers = {}) {
  const res = await fetch(API + url, { method, body, headers: { ...AUTH, ...headers } });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok || json.success === false) throw new Error(`${method} ${url} -> ${res.status} ${text.slice(0, 600)}`);
  return json;
}

// Embed every file in the Worker (same pattern as the other *-poc previews on this account).
const FILES = {};
for (const [path, m] of Object.entries(manifest)) FILES[path] = { t: byHash[m.hash].type, c: byHash[m.hash].b64 };

const workerJs = `const FILES = ${JSON.stringify(FILES)};
const TEXT = /^(text\\/|application\\/javascript)/;
const NOT_FOUND = "<!doctype html><meta charset=utf-8><title>Not found</title><body style=\\"font-family:system-ui;padding:3rem\\"><h1>Page not found</h1><p><a href=\\"/\\">Philadelphia Gas &amp; Electric home</a></p>";
function resolve(pathname) {
  let p = decodeURIComponent(pathname);
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "/") return "/index.html";
  if (FILES[p]) return p;
  if (FILES[p + ".html"]) return p + ".html";
  return null;
}
export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    const url = new URL(request.url);
    const key = resolve(url.pathname);
    const headers = new Headers({
      "X-Robots-Tag": "noindex, nofollow", // demonstration site: keep out of search until the client approves launch
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    if (!key) {
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(request.method === "HEAD" ? null : NOT_FOUND, { status: 404, headers });
    }
    const f = FILES[key];
    headers.set("Content-Type", TEXT.test(f.t) ? f.t + "; charset=utf-8" : f.t);
    headers.set("Cache-Control", key.startsWith("/assets/") ? "public, max-age=86400" : "public, max-age=300");
    const bin = atob(f.c);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Response(request.method === "HEAD" ? null : bytes, { status: 200, headers });
  },
};
`;
const metadata = { main_module: "worker.js", compatibility_date: "2026-11-01" };
const form = new FormData();
form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
form.append("worker.js", new Blob([workerJs], { type: "application/javascript+module" }), "worker.js");
console.log("worker size:", (workerJs.length / 1024).toFixed(0), "KB");
const dep = await api("PUT", `/accounts/${ACCOUNT}/workers/scripts/${NAME}`, form);
console.log("worker deployed:", dep.result.id, dep.result.modified_on);

// 4. custom domain (creates the proxied DNS record automatically)
const dom = await api("PUT", `/accounts/${ACCOUNT}/workers/domains`, JSON.stringify({ hostname: HOST, service: NAME, environment: "production", zone_id: ZONE }), { "content-type": "application/json" });
console.log("custom domain:", dom.result.hostname, "->", dom.result.service);
