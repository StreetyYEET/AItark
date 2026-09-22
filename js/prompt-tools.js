(function () {
  "use strict";

  function initBuilder() {
    const form = document.getElementById("builder-form");
    if (!form) return;
    const preview = document.getElementById("builder-preview");
    const copyBtn = document.getElementById("builder-copy");
    const fields = {
      role: document.getElementById("f-role"),
      task: document.getElementById("f-task"),
      context: document.getElementById("f-context"),
      format: document.getElementById("f-format"),
      constraints: document.getElementById("f-constraints")
    };
    let touched = false;

    function build() {
      const parts = [];
      if (fields.role.value.trim()) parts.push(fields.role.value.trim());
      if (fields.task.value.trim()) parts.push("Ülesanne: " + fields.task.value.trim());
      if (fields.context.value.trim()) parts.push("Kontekst: " + fields.context.value.trim());
      if (fields.format.value.trim()) parts.push("Vorming/pikkus: " + fields.format.value.trim());
      if (fields.constraints.value.trim()) parts.push("Piirangud/toon: " + fields.constraints.value.trim());
      return parts.join("\n\n");
    }
    function render() {
      const text = build();
      if (!text) {
        preview.innerHTML = '<p class="empty">Hakka täitma välju vasakul. Sinu prompt koostatakse siia automaatselt.</p>';
      } else {
        const pre = document.createElement("pre");
        pre.textContent = text;
        preview.innerHTML = "";
        preview.appendChild(pre);
      }
      if (!touched) {
        touched = true;
        window.AiTargalt.Progress.set("promptimine", "in-progress");
      }
    }
    Object.values(fields).forEach(function (el) {
      el.addEventListener("input", render);
    });
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        const text = build();
        if (text) window.AiTargalt.copyToClipboard(text, copyBtn);
      });
    }
    render();
  }

  const EXAMPLES = [
    {
      title: "E-kirja kirjutamine",
      bad: "Kirjuta email kliendile.",
      good: "Oled klienditeeninduse spetsialist. Kirjuta viisakas ja lühike e-kiri kliendile Marile, kes küsis tellimuse nr 4521 tarneaega. Selgita, et tarne hilineb 3 päeva laoseisu tõttu, vabanda ja paku 10% allahindlust järgmisele ostule. Pikkus max 120 sõna, toon sõbralik ja professionaalne.",
      why: "Hea versioon annab rolli, konkreetse olukorra, soovitud sisu ja piirid (pikkus, toon). AI ei pea midagi asendama."
    },
    {
      title: "Koodi silumine",
      bad: "See kood ei tööta, paranda ära.",
      good: "Allolev Python funktsioon peaks arvutama keskmise, aga listi [2, 4, 6] korral tagastab 3, mitte 4. Kood: [kood siia]. Selgita samm-sammult, kus viga on, ja paku parandatud versioon koos kommentaaridega.",
      why: "Konkreetne sisend, oodatud vs tegelik tulemus ja soov samm-sammult selgituse järele aitavad AI-l vea täpselt tuvastada."
    },
    {
      title: "Kokkuvõtte tegemine",
      bad: "Tee kokkuvõte sellest tekstist.",
      good: "Tee allolevast 5-leheküljelisest raportist juhtkonnale mõeldud kokkuvõte: maksimaalselt 5 punkti, iga punkt üks lause, fookuses põhijäreldused ja soovitused, mitte metoodika kirjeldus.",
      why: "Määratud on sihtgrupp, pikkus, struktuur ja mida välja jätta. Tulemus on kohe kasutuskõlblik."
    },
    {
      title: "Turundustekst",
      bad: "Kirjuta reklaamtekst meie tootele.",
      good: "Oled loominguline copywriter. Kirjuta Instagrami postituse tekst (max 280 tähemärki) meie uuele taaskasutatud materjalist joogipudelile. Sihtgrupp: 20–35a keskkonnateadlikud tarbijad Eestis. Toon: energiline ja sõbralik. Lisa 3 asjakohast hashtagi ja üks selge tegevusele suunav lõpp.",
      why: "Roll, kanal, pikkus, sihtgrupp, toon ja konkreetsed lisanõuded (hashtagid, CTA) jätavad vähe ruumi valesti mõistmiseks."
    },
    {
      title: "Andmete analüüs",
      bad: "Analüüsi seda tabelit.",
      good: "Siin on müügiandmed kvartalite lõikes (tabel lisatud). Leia 3 kõige olulisemat trendi, too iga trendi kohta üks konkreetne arv tabelist ja paku üks tegevussoovitus iga trendi kohta. Esita vastus punktidena, ilma pika sissejuhatuseta.",
      why: "Täpne väljundi struktuur (3 trendi, arvud, soovitus, punktid) muudab vastuse võrreldavaks ja kohe kasutatavaks."
    }
  ];

  function initCompare() {
    const wrap = document.getElementById("compare-list");
    if (!wrap) return;
    EXAMPLES.forEach(function (ex, i) {
      const card = document.createElement("div");
      card.className = "card compare-card";
      const id = "cmp-" + i;
      card.innerHTML =
        '<h3>' + ex.title + '</h3>' +
        '<div class="compare-tabs" role="tablist" aria-label="' + ex.title + '">' +
          '<button type="button" class="bad" role="tab" aria-selected="true" aria-controls="' + id + '-bad" id="' + id + '-tab-bad">Halb prompt</button>' +
          '<button type="button" class="good" role="tab" aria-selected="false" aria-controls="' + id + '-good" id="' + id + '-tab-good">Hea prompt</button>' +
        '</div>' +
        '<div class="compare-body">' +
          '<div class="compare-panel" id="' + id + '-bad" role="tabpanel" aria-labelledby="' + id + '-tab-bad">' +
            '<p class="prompt-text">“' + ex.bad + '”</p>' +
            '<p class="why"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg> Liiga üldine. AI peab enamiku otsuseid ise ära arvama, tulemus on juhuslik.</p>' +
          '</div>' +
          '<div class="compare-panel" id="' + id + '-good" role="tabpanel" aria-labelledby="' + id + '-tab-good" hidden>' +
            '<p class="prompt-text">“' + ex.good + '”</p>' +
            '<p class="why"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg> ' + ex.why + '</p>' +
          '</div>' +
        '</div>';
      wrap.appendChild(card);

      const tabs = card.querySelectorAll('[role="tab"]');
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.setAttribute("aria-selected", "false"); });
          tab.setAttribute("aria-selected", "true");
          card.querySelectorAll(".compare-panel").forEach(function (p) { p.hidden = true; });
          document.getElementById(tab.getAttribute("aria-controls")).hidden = false;
          window.AiTargalt.Progress.set("promptimine", "in-progress");
        });
      });
    });
  }

  function initRater() {
    const textarea = document.getElementById("rater-input");
    const btn = document.getElementById("rater-btn");
    const result = document.getElementById("rater-result");
    if (!textarea || !btn) return;

    const CHECKS = [
      { id: "length", label: "Prompt on piisavalt pikk, et anda konteksti (üle 12 sõna)", test: function (t) { return t.trim().split(/\s+/).filter(Boolean).length >= 12; } },
      { id: "format", label: "Määratud on soovitud vorming, pikkus või struktuur", test: function (t) { return /(sõna|lause|punkt|tabel|lõi(k|gu)|pikkus|vorming|list|samm)/i.test(t); } },
      { id: "role", label: "Antud on roll, sihtgrupp või kontekst", test: function (t) { return /(oled|sina oled|sihtgrupp|kliendi|kontekst|tegutse kui)/i.test(t); } },
      { id: "verb", label: "Kasutatud on konkreetset tegevussõna (kirjuta, analüüsi, loo, selgita...)", test: function (t) { return /(kirjuta|analüüsi|loo|koosta|selgita|võrdle|tõlgi|paranda|tee kokkuvõte|loetle)/i.test(t); } },
      { id: "constraint", label: "Sees on piirang või toon (nt „väldi“, „toon“, „ära“, „max“)", test: function (t) { return /(väldi|toon|ära|max|maksimaalselt|ilma)/i.test(t); } }
    ];

    btn.addEventListener("click", function () {
      const text = textarea.value;
      result.innerHTML = "";
      let passed = 0;
      CHECKS.forEach(function (c) {
        const ok = text.trim() ? c.test(text) : false;
        if (ok) passed++;
        const row = document.createElement("div");
        row.className = "rater-check " + (ok ? "pass" : "fail");
        row.innerHTML = (ok
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>'
        ) + c.label;
        result.appendChild(row);
      });
      const summary = document.createElement("p");
      summary.style.marginTop = "6px";
      summary.style.fontWeight = "700";
      summary.textContent = "Tulemus: " + passed + " / " + CHECKS.length + ". See on lihtne heuristika, mitte AI-hinnang.";
      result.appendChild(summary);
      result.classList.add("show");
      window.AiTargalt.Progress.set("promptimine", "in-progress");
    });
  }

  function initAnatomy() {
    document.querySelectorAll(".anatomy-part").forEach(function (part) {
      part.setAttribute("tabindex", "0");
      part.addEventListener("click", function () {
        window.AiTargalt.Progress.set("promptimine", "in-progress");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initBuilder();
    initCompare();
    initRater();
    initAnatomy();
  });
})();
