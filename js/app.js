(function () {
  "use strict";

  const STORAGE_THEME = "ai-targalt-theme";
  const STORAGE_PROGRESS = "ai-targalt-progress";

  function initTheme() {
    const btn = document.getElementById("theme-toggle");
    const root = document.documentElement;
    const saved = localStorage.getItem(STORAGE_THEME);
    if (saved) root.setAttribute("data-theme", saved);

    function current() {
      if (root.getAttribute("data-theme")) return root.getAttribute("data-theme");
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    function reflect() {
      if (!btn) return;
      const dark = current() === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Lülitu heledale teemale" : "Lülitu tumedale teemale");
    }
    reflect();
    if (btn) {
      btn.addEventListener("click", function () {
        const next = current() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem(STORAGE_THEME, next);
        reflect();
      });
    }
  }

  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const Progress = {
    KEY: STORAGE_PROGRESS,
    read: function () {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_PROGRESS)) || {};
      } catch (e) {
        return {};
      }
    },
    set: function (moduleId, state) {
      const data = Progress.read();
      const order = { "not-started": 0, "in-progress": 1, "done": 2 };
      if (!data[moduleId] || order[state] >= order[data[moduleId]]) {
        data[moduleId] = state;
        localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(data));
      }
      Progress.render();
    },
    render: function () {
      const data = Progress.read();
      document.querySelectorAll("[data-progress-for]").forEach(function (el) {
        const id = el.getAttribute("data-progress-for");
        const state = data[id] || "not-started";
        el.setAttribute("data-state", state);
        const label = { "not-started": "Pole alustatud", "in-progress": "Pooleli", "done": "Lõpetatud" }[state];
        const textEl = el.querySelector("[data-progress-label]");
        if (textEl) textEl.textContent = label;
      });
      const modules = ["turvalisus", "promptimine", "viktoriin"];
      const doneCount = modules.filter(function (m) { return data[m] === "done"; }).length;
      document.querySelectorAll("[data-progress-summary]").forEach(function (el) {
        el.textContent = doneCount + " / " + modules.length + " moodulit läbitud";
      });
      document.querySelectorAll("[data-progress-dot]").forEach(function (el) {
        el.style.background = doneCount === modules.length
          ? "var(--signal-safe)"
          : (doneCount > 0 ? "var(--signal-caution)" : "var(--border-strong)");
      });
    }
  };
  window.AiTargalt = window.AiTargalt || {};
  window.AiTargalt.Progress = Progress;

  const PATTERNS = [
    { type: "Eesti isikukood", re: /\b[1-8]\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{4}\b/g },
    { type: "E-posti aadress", re: /[^\s@]+@[^\s@]+\.[^\s@]{2,}/g },
    { type: "IBAN / pangakonto", re: /\bEE\d{2}[ ]?\d{2}[ ]?\d{4}[ ]?\d{4}[ ]?\d{4}[ ]?\d{3}\b/gi },
    { type: "Pangakaardi number", re: /\b(?:\d[ -]?){13,16}\b/g },
    { type: "Telefoninumber", re: /\b(\+372[ ]?)?\d{3,4}[ ]?\d{3,4}\b/g },
    { type: "Võimalik parool/võti", re: /\b(api[_-]?key|secret|password|parool|token)\b\s*[:=]\s*\S+/gi }
  ];
  function scanText(text) {
    const hits = [];
    PATTERNS.forEach(function (p) {
      const found = text.match(p.re);
      if (found && found.length) hits.push({ type: p.type, count: found.length });
    });
    return hits;
  }
  window.AiTargalt.scanText = scanText;

  window.AiTargalt.copyToClipboard = function (text, btn) {
    function done(ok) {
      if (!btn) return;
      const original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = ok ? "Kopeeritud ✓" : "Ei õnnestunud";
      setTimeout(function () { btn.textContent = original; }, 1800);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }).catch(function () { done(false); });
    } else {
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done(true);
      } catch (e) { done(false); }
    }
  };

  function initAccordion() {
    document.querySelectorAll(".accordion-item").forEach(function (item) {
      const btn = item.querySelector("button");
      const panel = item.querySelector(".panel");
      if (!btn || !panel) return;
      btn.addEventListener("click", function () {
        const open = item.getAttribute("data-open") === "true";
        item.setAttribute("data-open", String(!open));
        btn.setAttribute("aria-expanded", String(!open));
        panel.style.maxHeight = !open ? panel.scrollHeight + "px" : "0px";
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initAccordion();
    Progress.render();
  });
})();
