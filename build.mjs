#!/usr/bin/env node
/**
 * Zero-dependency static build for the PGE proof of concept.
 *
 *   node build.mjs
 *
 * Reads  src/pages/*.html   (page body + front matter)
 *        src/partials/*.html (head, header, footer, dock)
 * Writes the finished pages into the repo root (index.html, services.html, …).
 * The generated HTML is committed so the site can be served by any static host
 * with no build step; run this only after editing src/ or assets/js/config.js.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(root, p), "utf8");

/* ---- config (same file the browser loads) ---- */
const sandbox = { window: {} };
vm.runInNewContext(read("assets/js/config.js"), sandbox);
const CFG = sandbox.window.PGE_CONFIG;
const SITE_ORIGIN = "https://pgecomfort.oculeusltd.com"; // proposed demonstration domain

/* ---- icons (24×24 stroke icons, MIT-style geometry) ---- */
const ICONS = {
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "check-circle": '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  "map-pin": '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  "shield-check": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  snowflake: '<path d="M2 12h20M12 2v20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/>',
  wind: '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4M12 17h.01"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  dollar: '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  tag: '<path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l8.59-8.59a1 1 0 0 0 0-1.41z"/><path d="M7 7h.01"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  list: '<path d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.76 2 2 2h4M15 21c3 0 7-1 7-8V5c0-1.25-.76-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.76 2 2 2h4"/>',
};
const sprite =
  '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' +
  Object.entries(ICONS)
    .map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`)
    .join("") +
  "</svg>";

const icon = (name, extra = "") =>
  `<svg class="icon${extra ? " " + extra : ""}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;


/* ---- macros ---- */
const stars = (n = 5) => `<span class="stars" role="img" aria-label="${n} out of 5 stars">${Array(n).fill(icon("star", "icon--fill")).join("")}</span>`;

const macros = {
  icon: (name, extra) => icon(name, extra),
  stars: (n) => stars(Number(n) || 5),
  // {{sched|Label|extra classes}}
  sched: (label, extra = "") =>
    `<a class="btn ${extra}" href="${CFG.BOOKING_URL}" data-booking target="_blank" rel="noopener noreferrer">${icon("calendar")}<span>${label || "Schedule Service"}</span></a>`,
  // {{call|extra classes|label}}
  call: (extra = "", label) =>
    `<a class="btn ${extra}" href="${CFG.PHONE_URL}" data-phone>${icon("phone")}<span>${label || `Call ${CFG.PHONE_DISPLAY}`}</span></a>`,
  // {{mail|extra classes|label}}
  mail: (extra = "", label) =>
    `<a class="btn ${extra}" href="${CFG.EMAIL_URL}" data-email>${icon("mail")}<span>${label || CFG.EMAIL}</span></a>`,
  // {{contact|extra classes|label}}
  contact: (extra = "", label) =>
    `<a class="btn ${extra}" href="${CFG.CONTACT_URL}" data-contact target="_blank" rel="noopener noreferrer"><span>${label || "Send an inquiry"}</span>${icon("external")}</a>`,
  // {{plate|text}} the signature data-plate tag
  plate: (text) => `<span class="plate">${text}</span>`,
};

/* ---- truthful structured data: no AggregateRating / Review (assessment rule) ---- */
function jsonLd(ctx) {
  const business = {
    "@type": "HVACBusiness",
    "@id": "https://pgecomfort.com/#business",
    name: "Philadelphia Gas & Electric",
    url: "https://pgecomfort.com/",
    telephone: "+1-215-743-0500",
    email: "info@pgecomfort.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "4512 Paul Street",
      addressLocality: "Philadelphia",
      addressRegion: "PA",
      postalCode: "19124",
      addressCountry: "US",
    },
    areaServed: { "@type": "City", name: "Philadelphia" },
  };
  const graph = [
    business,
    {
      "@type": "WebPage",
      "@id": `${SITE_ORIGIN}${ctx.canonical}#webpage`,
      url: `${SITE_ORIGIN}${ctx.canonical}`,
      name: ctx.title,
      description: ctx.description,
      about: { "@id": "https://pgecomfort.com/#business" },
    },
  ];
  if (ctx.nav !== "home") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: ctx.crumb, item: `${SITE_ORIGIN}${ctx.canonical}` },
      ],
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>`;
}

function render(tpl, ctx) {
  let out = tpl;
  // partial includes first (they may contain macros)
  out = out.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => read(`src/partials/${n}.html`));
  // aria-current markers
  out = out.replace(/\{\{aria:([\w-]+)\}\}/g, (_, n) => (ctx.nav === n ? ' aria-current="page"' : ""));
  // macros with pipe args
  out = out.replace(/\{\{([a-z]+)((?:\|[^}|]*)*)\}\}/g, (m, name, args) => {
    if (!(name in macros)) return m;
    const a = args ? args.slice(1).split("|") : [];
    return macros[name](...a);
  });
  // variables
  out = out.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in ctx ? ctx[k] : k in CFG ? CFG[k] : m));
  return out;
}

const pages = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".html")).sort();
const shell = read("src/partials/shell.html");
let count = 0;
for (const f of pages) {
  const src = read(`src/pages/${f}`);
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${f}: missing front matter`);
  const ctx = { SITE_ORIGIN };
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    ctx[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const body = render(m[2], ctx);
  const html = render(shell, { ...ctx, body, sprite });
  // body must be injected after rendering to avoid double-processing
  writeFileSync(join(root, ctx.file), html.replace("<!--BODY-->", body).replace("<!--SPRITE-->", sprite).replace("<!--JSONLD-->", jsonLd(ctx)));
  console.log("built", ctx.file);
  count++;
}
console.log(`${count} pages built.`);
