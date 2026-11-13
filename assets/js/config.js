/**
 * Philadelphia Gas & Electric — site configuration (single source of truth)
 *
 * BOOKING LINK POLICY (from the Penn_11 assessment)
 * -------------------------------------------------
 * - No client-owned booking calendar has been verified.
 * - For the proof of concept only, every "Schedule Service" action points at the
 *   Oculeus DEMONSTRATION calendar below. It is NOT a Philadelphia Gas & Electric
 *   calendar and appointments made there are not confirmed by the client.
 * - If the client supplies a verified booking URL: paste it into BOOKING_URL
 *   EXACTLY (full path + query string) and set BOOKING_MODE to "client".
 *   That hides every demo disclosure and re-points all booking CTAs.
 * - Never replace a genuine client booking link with the demo link.
 *
 * The static HTML ships with the same default URL in each href, so booking works
 * with JavaScript disabled. When you change BOOKING_URL here, also run
 * `node build.mjs` so the no-JS fallback hrefs stay in sync.
 */
window.PGE_CONFIG = {
  BOOKING_MODE: "demo", // "demo" | "client"
  BOOKING_URL: "https://cal.com/oculeus-ltd/us-gmt",
  CONTACT_URL: "https://pgecomfort.com/contact/", // existing inquiry form — NOT a live scheduler
  PHONE_URL: "tel:2157430500",
  PHONE_DISPLAY: "(215) 743-0500",
  EMAIL_URL: "mailto:info@pgecomfort.com",
  EMAIL: "info@pgecomfort.com",

  /**
   * Verified service areas. Intentionally EMPTY: the assessment forbids listing
   * neighbourhoods or suburbs that have not been confirmed by the client.
   * Add plain strings (e.g. "Fishtown") once confirmed and they render on
   * /service-areas automatically.
   */
  VERIFIED_SERVICE_AREAS: [],
};
