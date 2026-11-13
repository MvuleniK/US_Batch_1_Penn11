# Philadelphia Gas & Electric — front-end proof of concept

Static, five-page HVAC website built in plain **HTML, CSS and JavaScript** (no framework, no runtime dependencies).
Design source: the Stitch "Heritage Trade Industrial" layouts, then re-art-directed with the unslop method (see *Design direction*). Content source: the `Penn_11` structured assessment plus the client's live site, pgecomfort.com (captured 13 Nov 2026).

| Page | File | Clean URL |
|---|---|---|
| Home | `index.html` | `/` |
| Services | `services.html` | `/services` |
| Service Areas | `service-areas.html` | `/service-areas` |
| Reviews | `reviews.html` | `/reviews` |
| Schedule / Contact | `schedule-service.html` | `/schedule-service` |

## Run it

```bash
python3 -m http.server 8000      # or any static server; then open http://localhost:8000
```

The generated `.html` files are committed, so any static host works with **no build step**. `vercel.json` enables clean URLs. Deploying to `https://pgecomfort.oculeusltd.com` needs DNS authorisation (assessment §12).

## Deployment

Live demo: **https://pgecomfort.oculeusltd.com** (Cloudflare Worker `pgecomfort-poc` with a Workers Custom Domain on the `oculeusltd.com` zone, same pattern as the other client previews). The site sends `X-Robots-Tag: noindex` and a disallow-all `robots.txt` until the client approves launch.

```bash
node build.mjs                                   # regenerate pages if you edited src/ or config.js
CLOUDFLARE_API_TOKEN=... node deploy/cloudflare.mjs   # redeploy (add --dry to just list files)
```

Cloudflare's zone-level Web Analytics adds its own `/cdn-cgi/rum` beacon on the live domain; this is not part of the site code. Decide whether to keep it, and add consent handling if so, before production.

## Editing

Shared header, footer and mobile dock live once in `src/partials/`; page bodies live in `src/pages/`. After editing either, or `assets/js/config.js`, regenerate with:

```bash
node build.mjs          # zero dependencies, Node 18+
```

## Booking-link configuration (single source of truth)

`assets/js/config.js` holds `BOOKING_URL`, `BOOKING_MODE` (`"demo"` | `"client"`), `CONTACT_URL`, phone and email.

- **Now (`demo`)**: every *Schedule Service* CTA opens `https://cal.com/oculeus-ltd/us-gmt`, an **Oculeus demonstration calendar**, with demo disclosures shown (top bar, schedule page, footer). No client-owned calendar was verified; the existing `/contact/` Bitform is kept only as a separate, labelled *inquiry* route.
- **When the client supplies a verified link**: paste it into `BOOKING_URL` **exactly** (path and query string), set `BOOKING_MODE` to `"client"`, run `node build.mjs`. All CTAs re-point and every demo disclosure hides. Never replace a genuine client link with the demo one.
- Booking works with JavaScript disabled (static hrefs carry the same URL) and when embeds are blocked (the optional on-page preview always sits next to a direct link).

## Design direction (unslop pass)

The visual system was audited and rebuilt with the [unslop](https://github.com/heydamir/unslop) method by Damir Sokolovsky (CC BY 4.0): audit the slop, set a direction from the product, then fix spacing, colour, icons, copy, type, layout, details, visuals and motion in order.

| | |
|---|---|
| **Product** | Family-owned HVAC contractor for Philadelphia homes; visitors schedule or call |
| **Character** | Steady, plainspoken, reassuring |
| **World** | Brick rowhouses, the basement mechanical room, slate and iron, the data plate on a boiler |
| **Moments** | The real team photo; the real Google reviews |
| **Signature** | The *data plate*: a small mono keyline tag for licence no., sources and photo captions |

**Colour and emotion.** The client's real brand is red and gold on dark ink (`#D7263D`, `#F2C94C`, `#1F2933` on pgecomfort.com and in the logo), not the navy and copper from the Stitch mock-up. Chosen palette: a cool slate neutral ramp (calm, competent) with the brand red reserved for the primary action (warm, decisive, continuous with the logo customers already know). Ink is used for the secondary *Call* action so red never competes with itself. Gold appears only in review stars. Slate anchors only the footer and prototype bar. Because visitors are often stressed (no heat, no A/C), the design leads with reassurance: generous space, plain copy, one red action per region. Verified contrast: body 16.5:1, secondary 7.0:1, muted 5.2:1, white on red 5.0:1.

**What changed from the Stitch build.** Removed: hue gradients and glows, grid-line and radial decoration, pill badges, uppercase tracked labels, 700-weight headings, italic emphasis, hover lifts and boxed icon tiles, repeated amber warning panels (provenance is now a quiet note per section plus a mono source plate), and five red buttons on one card row. Added or changed: Newsreader for headlines only (echoing the slab serif in the logo), Hanken Grotesk for the interface at weights 400–600, Geist Mono for plates, a 4px spacing scale, nested radii (8/12/16), one easing curve with colour/opacity/transform transitions only, and varied layouts (service rows, spec-sheet credentials, feature-plus-stack reviews, masonry review wall) instead of walls of equal cards.

## Content provenance — nothing is invented

Per the brief, everything the owner should see from the existing site is included, labelled with its source. Look for the amber **"Source & status"** notes and the grey **"Per pgecomfort.com"** tags.

| Content | Source | Status |
|---|---|---|
| H1, 4.9/5 · 215 reviews, family-owned since 1955 | Assessment | Rating shown as a dated snapshot |
| 7 named Google reviewers + 3 unattributed quotes, 5-star display | pgecomfort.com Testimonials widget (Trustindex) | Confirm permission to republish |
| **NATE Certified**, **Bryant Factory Authorized**, **OSHA Certified** badges | pgecomfort.com Certified Techs page | Unverified; client to confirm |
| **Licence No. PA018673** | pgecomfort.com footer | Unverified; client to confirm |
| 70+ yrs, 15+ yrs technician experience, "up to 40% less", 35-year owner | pgecomfort.com | Company claims, labelled as such |
| 0% / 12-month financing, up to $300 rebate, $99 tune-up, $25/mo Home Comfort Plan | pgecomfort.com Specials / Financing / Plan | Confirm current before launch |
| Address 4512 Paul Street 19124, office hours | pgecomfort.com footer | Confirm |
| Service copy and FAQs | pgecomfort.com service pages (condensed) | Confirm exact offerings |
| **Logo** and **photos** (owner Mike, technicians Scott and Luke, van, customer visits) | pgecomfort.com media library | Client-owned; confirm reuse rights before launch |

**Deliberately not carried over from the Stitch mock-ups** (invented, contradicted by the source, or forbidden by the assessment): the licence number "PA-HVAC #04821" (the live site shows **PA018673**), the fake Cal.com availability grid and "TRANSMIT TEST INQUIRY" slots, "24/7 emergency dispatch", "100% licensed & insured", "<2 hr" and "15-minute triage" timings, invented neighborhoods/ZIP lists and fleet-radius maps, AFUE/efficiency statistics, and the invented vintage-truck/1982 history. Stitch's AI-generated "technician" portraits and phone-screenshot image were also dropped.

## Known discrepancies to resolve with the client

- Review count: assessment snapshot **215**; the live site's Google widget showed **209** on 13 Nov 2026.
- The site is `noindex` (meta tag, `robots.txt`, `vercel.json` header). Remove all three for production.
- Photos and the logo were copied from the client's own site for the proof of concept. Confirm reuse rights, and replace with supplied originals at full resolution for production.
- Brand colours are now taken from the client's live site (red `#D7263D`, gold `#F2C94C`, ink `#1F2933`). The slate neutral ramp is a design proposal that still needs brand sign-off. The assessment's Teko/Ledger fonts were not used; fonts are swappable in `assets/css/styles.css`.
- "Up to 40% less than big competitors" and other comparative claims are the company's own published statements; the client should confirm they can be substantiated.
- Not yet measured: Lighthouse/INP on the built site, screen-reader pass, tablet breakpoints beyond 768 px review.

## Built-in behaviour

- Accessible mobile drawer (Escape closes, `aria-expanded`), skip link, visible focus, native `<details>` FAQ, 44 px+ tap targets, reduced-motion support.
- Mobile sticky Call / Schedule dock.
- Inquiry form on the schedule page is a **sandbox** (labelled, validated, makes no network request).
- Analytics *proposal*: `schedule_click`, `call_click`, `email_click`, `contact_link_click`, `contact_submit` push to `window.dataLayer` only if a tag manager has created it. No collection is assumed.
- JSON-LD uses `HVACBusiness` + `WebPage` + `BreadcrumbList` only; **no** `AggregateRating` or `Review` markup.
- Service areas list renders only from `VERIFIED_SERVICE_AREAS` (empty until the client confirms).
