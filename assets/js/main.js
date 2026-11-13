/**
 * Philadelphia Gas & Electric — site behaviour (progressive enhancement).
 * Everything here is optional: links, navigation and FAQ work without JS.
 */
(function () {
  "use strict";

  var cfg = window.PGE_CONFIG || {};
  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---- 1. Apply central config to every CTA ------------------------------ */
  function applyConfig() {
    $$("[data-booking]").forEach(function (a) {
      if (cfg.BOOKING_URL) a.setAttribute("href", cfg.BOOKING_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
    $$("[data-contact]").forEach(function (a) {
      if (cfg.CONTACT_URL) a.setAttribute("href", cfg.CONTACT_URL);
    });
    $$("[data-phone]").forEach(function (a) {
      if (cfg.PHONE_URL) a.setAttribute("href", cfg.PHONE_URL);
    });
    $$("[data-email]").forEach(function (a) {
      if (cfg.EMAIL_URL) a.setAttribute("href", cfg.EMAIL_URL);
    });
    $$("[data-booking-mode-text]").forEach(function (el) {
      el.textContent = cfg.BOOKING_MODE || "demo";
    });
    var isClient = cfg.BOOKING_MODE === "client";
    $$("[data-demo-only]").forEach(function (el) {
      el.hidden = isClient;
    });
    $$("[data-client-only]").forEach(function (el) {
      el.hidden = !isClient;
    });
    document.documentElement.setAttribute("data-booking-mode", cfg.BOOKING_MODE || "demo");
  }

  /* ---- 2. Mobile navigation drawer --------------------------------------- */
  function initMenu() {
    var btn = $(".menu-toggle");
    var drawer = $("#mobile-menu");
    if (!btn || !drawer) return;

    function setOpen(open) {
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.hidden = !open;
      if (open) {
        // Sit directly under the header, even when the demo bar is still visible above it.
        var hdr = $(".site-header");
        drawer.style.top = Math.max(0, Math.round(hdr.getBoundingClientRect().bottom)) + "px";
      }
      document.body.classList.toggle("menu-open", open);
    }
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        btn.focus();
      }
    });
    $$("a", drawer).forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });
    window.matchMedia("(min-width: 1240px)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });
  }

  /* ---- 3. Header shadow on scroll ---------------------------------------- */
  function initScroll() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- 4. Analytics event *proposal* ------------------------------------- *
   * Pushes to window.dataLayer only when a tag manager has already created it.
   * No collection is assumed or configured by this PoC.                       */
  function track(name, detail) {
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: name, cta_location: detail || "" });
      }
    } catch (e) {
      /* never break the page for analytics */
    }
  }
  function initTracking() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var where = a.getAttribute("data-track") || (a.closest("header") ? "header" : a.closest("footer") ? "footer" : a.closest(".dock") ? "dock" : "page");
      if (a.hasAttribute("data-booking")) track("schedule_click", where);
      else if (a.hasAttribute("data-contact")) track("contact_link_click", where);
      else if ((a.getAttribute("href") || "").indexOf("tel:") === 0) track("call_click", where);
      else if ((a.getAttribute("href") || "").indexOf("mailto:") === 0) track("email_click", where);
    });
  }

  /* ---- 5. Optional embedded calendar (always keeps the direct link) ------- */
  function initEmbed() {
    var btn = $("[data-embed-btn]");
    var shell = $("[data-embed-shell]");
    if (!btn || !shell || !cfg.BOOKING_URL) return;
    btn.hidden = false;
    shell.hidden = false;
    btn.addEventListener("click", function () {
      if ($("iframe", shell)) {
        shell.innerHTML = '<p class="embed-empty">Calendar preview closed.</p>';
        btn.textContent = "Preview calendar on this page";
        btn.setAttribute("aria-expanded", "false");
        return;
      }
      var f = document.createElement("iframe");
      f.src = cfg.BOOKING_URL;
      f.title = "Scheduling calendar preview";
      f.loading = "lazy";
      shell.innerHTML = "";
      shell.appendChild(f);
      var note = document.createElement("p");
      note.className = "embed-empty";
      note.textContent = "If the calendar does not appear (blocked embeds, script blockers, or a corporate firewall), use the “Open Scheduling Calendar” button above — it opens the same calendar directly.";
      shell.appendChild(note);
      btn.textContent = "Close calendar preview";
      btn.setAttribute("aria-expanded", "true");
    });
  }

  /* ---- 6. Service areas: render only client-verified areas ---------------- */
  function initAreas() {
    var list = $("[data-area-list]");
    var empty = $("[data-area-empty]");
    if (!list) return;
    var areas = cfg.VERIFIED_SERVICE_AREAS || [];
    if (!areas.length) return;
    areas.forEach(function (name) {
      var li = document.createElement("li");
      li.textContent = name;
      list.appendChild(li);
    });
    list.hidden = false;
    if (empty) empty.hidden = true;
  }

  /* ---- 7. Demo inquiry form: accessible validation, NO submission --------- */
  function initDemoForm() {
    var form = $("form[data-demo-form]");
    if (!form) return;
    var status = $("[data-form-status]", form);

    function setError(field, msg) {
      var wrap = field.closest(".field") || field.closest(".check-field");
      var err = wrap && $(".error", wrap);
      if (!wrap) return;
      wrap.classList.toggle("has-error", !!msg);
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg || "";
    }
    function validate() {
      var ok = true;
      var first = null;
      var name = form.elements.name;
      var contact = form.elements.contact;
      var request = form.elements.request;
      var consent = form.elements.consent;

      var checks = [
        [name, !name.value.trim(), "Enter your name."],
        [
          contact,
          !(/^\S+@\S+\.\S+$/.test(contact.value.trim()) || contact.value.replace(/\D/g, "").length >= 10),
          "Enter an email address or a 10-digit phone number.",
        ],
        [request, request.value.trim().length < 5, "Tell us briefly what you need."],
        [consent, !consent.checked, "Please confirm consent to be contacted."],
      ];
      checks.forEach(function (c) {
        setError(c[0], c[1] ? c[2] : "");
        if (c[1]) {
          ok = false;
          if (!first) first = c[0];
        }
      });
      return { ok: ok, first: first };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = validate();
      status.className = "form-status";
      if (!r.ok) {
        status.className = "form-status is-error";
        status.textContent = "Please fix the highlighted fields and try again.";
        r.first.focus();
        return;
      }
      // Intentionally no network call: backend integration is required.
      status.className = "form-status is-ok";
      status.textContent = "Demo only — nothing was sent. This form is a layout preview; a backend must be connected before it can reach Philadelphia Gas & Electric. To reach the team now, call or email using the details on this page.";
      track("contact_submit", "demo_form");
      form.reset();
    });
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t && t.getAttribute("aria-invalid") === "true") validate();
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  ready(function () {
    applyConfig();
    initMenu();
    initScroll();
    initTracking();
    initEmbed();
    initAreas();
    initDemoForm();
  });
})();
