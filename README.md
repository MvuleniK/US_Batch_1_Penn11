# Philadelphia Gas & Electric — front-end proof of concept

Static, five-page HVAC website built in plain **HTML, CSS and JavaScript** (no framework, no runtime dependencies).
Design source: the Stitch "Heritage Trade Industrial" export. Content source: the `Penn_11` structured assessment plus the client's live site, pgecomfort.com (captured 13 Nov 2026).

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

**Deliberately not carried over from the Stitch mock-ups** (invented, contradicted by the source, or forbidden by the assessment): the licence number "PA-HVAC #04821" (the live site shows **PA018673**), the fake Cal.com availability grid and "TRANSMIT TEST INQUIRY" slots, "24/7 emergency dispatch", "100% licensed & insured", "<2 hr" and "15-minute triage" timings, invented neighborhoods/ZIP lists and fleet-radius maps, AFUE/efficiency statistics, and the invented vintage-truck/1982 history. Stitch's AI-generated "technician" portraits and phone-screenshot image were also dropped.

## Known discrepancies to resolve with the client

- Review count: assessment snapshot **215**; the live site's Google widget showed **209** on 13 Nov 2026.
- The site is `noindex` (meta tag, `robots.txt`, `vercel.json` header). Remove all three for production.
- Stitch imagery is low-resolution AI artwork, captioned "Illustrative". Swap in client-supplied photography (the live site has its own technician and team photos).
- Brand colours were not extracted; the palette is a proposal. Fonts follow the Stitch system (Space Grotesk, Hanken Grotesk, Newsreader); the assessment's Teko/Ledger can be swapped in `assets/css/styles.css`.
- Not yet measured: Lighthouse/INP on the built site, screen-reader pass, tablet breakpoints beyond 768 px review.

## Built-in behaviour

- Accessible mobile drawer (Escape closes, `aria-expanded`), skip link, visible focus, native `<details>` FAQ, 44 px+ tap targets, reduced-motion support.
- Mobile sticky Call / Schedule dock.
- Inquiry form on the schedule page is a **sandbox** (labelled, validated, makes no network request).
- Analytics *proposal*: `schedule_click`, `call_click`, `email_click`, `contact_link_click`, `contact_submit` push to `window.dataLayer` only if a tag manager has created it. No collection is assumed.
- JSON-LD uses `HVACBusiness` + `WebPage` + `BreadcrumbList` only; **no** `AggregateRating` or `Review` markup.
- Service areas list renders only from `VERIFIED_SERVICE_AREAS` (empty until the client confirms).
