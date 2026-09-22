(function () {
  "use strict";

  const QUESTIONS = [
    {
      q: "Milline neist andmetest on kõige ohtlikum jagada tavalise avaliku AI-vestlusrobotiga?",
      options: ["Ilmateate küsimus", "Isikukood", "Lemmiklooma nimi", "Riigi pealinn"],
      correct: 1,
      explain: "Isikukood võimaldab otsest tuvastamist ja seda ei tohi kunagi tavalisse AI-vestlusesse kirjutada."
    },
    {
      q: "Mida tähendab „andmete minimeerimine“ AI kasutamisel?",
      options: ["Kasutada võimalikult vähe AI tööriistu", "Jagada AI-le ainult ülesande täitmiseks vajalikku infot", "Kirjutada võimalikult lühikesi prompte", "Piirata AI kasutust ühe seadmega"],
      correct: 1,
      explain: "Minimeerimine tähendab, et jagad ainult seda, mida ülesande jaoks päriselt vaja on. See ei tähenda kogu olemasoleva konteksti jagamist."
    },
    {
      q: "Mis on „few-shot prompting“?",
      options: ["AI kiire vastamise seadistus", "Prompt, mis annab AI-le näited soovitud tulemusest", "Mudeli treenimine viie andmestikuga", "Vestluse pikkuse piirang"],
      correct: 1,
      explain: "Few-shot prompting tähendab, et lisad promptile ühe-paar näidet soovitud stiilist või struktuurist."
    },
    {
      q: "Miks ei tohiks API-võtmeid ega paroole AI vestlusesse kleepida?",
      options: ["AI ei suuda neid lugeda", "Need võivad jääda logidesse või salvestustesse ja lekkida", "See aeglustab vastust", "AI kustutab need automaatselt"],
      correct: 1,
      explain: "Sisestatud saladused võivad jääda vestluslukku, logidesse või kolmandate osapoolte salvestustesse."
    },
    {
      q: "Milline prompt annab tõenäoliselt parema tulemuse?",
      options: ["„Kirjuta midagi toote kohta“", "„Kirjuta 100-sõnaline entusiastlik Instagrami postitus meie uue e-koti kohta, sihtgrupp noored pered“", "„Aita tootega“", "„Toode on hea, kirjuta“"],
      correct: 1,
      explain: "Konkreetne pikkus, kanal, sihtgrupp ja toon jätavad AI-le vähem ruumi valesti arvata."
    },
    {
      q: "Mis on terviseandmed GDPR-i mõistes?",
      options: ["Tavalised avalikud andmed", "Eriliigilised (tundlikud) isikuandmed, mis vajavad erikaitset", "Andmed, mida tohib vabalt AI-le jagada", "Andmed, mis kehtivad ainult arstidele"],
      correct: 1,
      explain: "Terviseandmed kuuluvad eriliigiliste isikuandmete hulka ja vajavad spetsiaalset, nõuetele vastavat käitlemist."
    },
    {
      q: "Mida tasub teha, kui AI vastus on ebaselge või ebatäpne?",
      options: ["Loobuda AI kasutamisest", "Täpsustada prompti, lisada konteksti või näiteid ja proovida uuesti", "Kopeerida vastus ikkagi muutmata", "Vahetada teemat"],
      correct: 1,
      explain: "Promptimine on iteratiivne. Täpsustamine ja lisakontekst annavad enamasti kiiresti parema tulemuse."
    },
    {
      q: "Miks tasub kontrollida AI-tööriista andmekasutuse seadeid enne tundlikuma info jagamist?",
      options: ["Et teada, kas sisend võidakse kasutada mudeli edasiseks treenimiseks", "Et muuta fonti", "Et kiirendada vastust", "Pole vajalik, kõik tööriistad on samad"],
      correct: 0,
      explain: "Erinevad tööriistad ja plaanid käsitlevad sisendandmeid erinevalt. Mõni võib neid vaikimisi treeninguks kasutada."
    }
  ];

  let current = 0;
  let score = 0;
  let answered = false;

  function el(sel) { return document.querySelector(sel); }

  function render() {
    const card = el("#quiz-card");
    const progressFill = el("#quiz-progress-fill");
    const progressLabel = el("#quiz-progress-label");
    if (!card) return;

    if (current >= QUESTIONS.length) {
      renderResult();
      return;
    }

    answered = false;
    const item = QUESTIONS[current];
    progressFill.style.width = Math.round((current / QUESTIONS.length) * 100) + "%";
    progressLabel.textContent = "Küsimus " + (current + 1) + " / " + QUESTIONS.length;

    card.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.textContent = item.q;
    card.appendChild(h3);

    const opts = document.createElement("div");
    opts.className = "quiz-options";
    item.options.forEach(function (optText, idx) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-option";
      b.textContent = optText;
      b.addEventListener("click", function () { pick(idx, item, b, opts); });
      opts.appendChild(b);
    });
    card.appendChild(opts);

    const explain = document.createElement("div");
    explain.className = "quiz-explain";
    explain.id = "quiz-explain";
    card.appendChild(explain);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "btn btn-primary";
    nextBtn.id = "quiz-next";
    nextBtn.style.display = "none";
    nextBtn.textContent = (current === QUESTIONS.length - 1) ? "Vaata tulemust" : "Järgmine küsimus";
    nextBtn.addEventListener("click", function () { current++; render(); });
    card.appendChild(nextBtn);

    window.AiTargalt.Progress.set("viktoriin", "in-progress");
  }

  function pick(idx, item, btn, opts) {
    if (answered) return;
    answered = true;
    const correct = idx === item.correct;
    if (correct) score++;
    Array.prototype.forEach.call(opts.children, function (b, i) {
      b.disabled = true;
      if (i === item.correct) b.setAttribute("data-state", "correct");
      else if (b === btn) b.setAttribute("data-state", "wrong");
    });
    const explain = document.getElementById("quiz-explain");
    explain.textContent = (correct ? "Õige! " : "Vale. ") + item.explain;
    explain.classList.add("show");
    document.getElementById("quiz-next").style.display = "inline-flex";
  }

  function renderResult() {
    const card = el("#quiz-card");
    const progressFill = el("#quiz-progress-fill");
    const progressLabel = el("#quiz-progress-label");
    progressFill.style.width = "100%";
    progressLabel.textContent = "Valmis!";

    const pct = Math.round((score / QUESTIONS.length) * 100);
    const bestKey = "ai-targalt-quiz-best";
    const prevBest = parseInt(localStorage.getItem(bestKey) || "0", 10);
    const best = Math.max(prevBest, score);
    localStorage.setItem(bestKey, String(best));

    let msg;
    if (pct >= 87) msg = "Suurepärane! Sa tunned mõlemat teemat väga hästi.";
    else if (pct >= 62) msg = "Tubli tulemus. Vaata veel korra üle punktid, mille vastasid valesti.";
    else msg = "Hea algus. Tasub peatükid „Andmekaitse“ ja „Promptimine“ uuesti üle vaadata.";

    card.innerHTML =
      '<div class="quiz-result">' +
        '<div class="big-score">' + score + ' / ' + QUESTIONS.length + '</div>' +
        '<p>' + msg + '</p>' +
        '<p style="font-size:0.85rem;color:var(--content-faint);">Parim tulemus siin brauseris: ' + best + ' / ' + QUESTIONS.length + '</p>' +
        '<div class="btn-row" style="justify-content:center;">' +
          '<button class="btn btn-primary" id="quiz-restart" type="button">Proovi uuesti</button>' +
          '<a class="btn btn-secondary" href="index.html">Tagasi avalehele</a>' +
        '</div>' +
      '</div>';

    document.getElementById("quiz-restart").addEventListener("click", function () {
      current = 0; score = 0; render();
    });

    window.AiTargalt.Progress.set("viktoriin", "done");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("quiz-card")) render();
  });
})();
