(function () {
  "use strict";

  const SCENARIOS = [
    {
      text: "Küsid AI-lt üldist selgitust: „Kuidas toimib fotosüntees?“",
      correct: "safe",
      note: "Ei sisalda isiklikku ega konfidentsiaalset infot. Üldteadmiste küsimus on tavaliselt turvaline igas tavalises AI-tööriistas."
    },
    {
      text: "Kleebid AI-le kliendi täisnime, e-posti aadressi ja kaebuse sisu, et AI aitaks vastust koostada.",
      correct: "caution",
      note: "Tegemist on isikuandmetega. Kasuta ainult ettevõtte poolt heaks kiidetud ja andmekaitselepinguga (DPA) AI-tööriista, ja eemalda kui võimalik otsesed tuvastajad."
    },
    {
      text: "Sisestad vestlusesse enda või kolleegi isikukoodi, et „kontrollida“ midagi.",
      correct: "danger",
      note: "Isikukood võimaldab otsest tuvastamist ja seda ei tohi kunagi tavalisse AI-vestlusesse kirjutada."
    },
    {
      text: "Palud AI-l keeleliselt toimetada juba avaldatud pressiteate teksti.",
      correct: "safe",
      note: "Sisu on juba avalik. Keelelise toimetamise puhul pole tavaliselt tundlikkuse riski."
    },
    {
      text: "Kleebid sisse ettevõtte avaldamata finantsaruande täisteksti, et saada kiire kokkuvõte.",
      correct: "danger",
      note: "Avaldamata äriline/finantsinfo on kõrge riskiga: lekke korral suur kahju ning sisend võib jääda teenusepakkuja logidesse."
    },
    {
      text: "Küsid AI käest näidiskoodi, kuidas Pythonis massiivi sorteerida.",
      correct: "safe",
      note: "Üldine programmeerimisküsimus ilma pärisandmeteta on tavaliselt täiesti turvaline."
    },
    {
      text: "Sisestad AI-le API-võtme või parooli, et see aitaks vea leidmisel (debug).",
      correct: "danger",
      note: "Saladused ja ligipääsuvõtmed ei kuulu kunagi vestlusesse. Kasuta koodinäites platseholdereid nagu „SINU_VÕTI“."
    },
    {
      text: "Kirjeldad patsiendi haiguslugu detailselt, et AI aitaks raviplaani mõtestada.",
      correct: "danger",
      note: "Terviseandmed on GDPR-i mõistes eriliigilised isikuandmed. Need vajavad spetsiaalset, litsentseeritud ja nõuetele vastavat lahendust, mitte tavalist vestlusrobotit."
    },
    {
      text: "Jagad AI-le oma CV põhiteksti, et see aitaks tööintervjuuks valmistuda.",
      correct: "caution",
      note: "CV sisaldab isikuandmeid (nimi, kontakt, töökäik). Enamikus usaldusväärsetes tööriistades on see üldjuhul ok, kuid väldi lisaks tundlike andmete (isikukood, palk) lisamist."
    }
  ];

  const LABELS = {
    safe: { text: "Turvaline", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>' },
    caution: { text: "Ettevaatust", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>' },
    danger: { text: "Ära jaga", icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/></svg>' }
  };

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function init() {
    const board = document.getElementById("classifier-board");
    if (!board) return;
    const scoreFill = document.getElementById("classifier-fill");
    const scoreText = document.getElementById("classifier-score-text");
    const banner = document.getElementById("classifier-done-banner");
    let answered = 0;
    let correctCount = 0;
    const total = SCENARIOS.length;

    function updateScore() {
      const pct = Math.round((answered / total) * 100);
      if (scoreFill) scoreFill.style.width = pct + "%";
      if (scoreText) scoreText.textContent = correctCount + " õiget / " + answered + " vastatud (" + total + " kokku)";
      if (answered === 1) window.AiTargalt.Progress.set("turvalisus", "in-progress");
      if (answered === total) {
        window.AiTargalt.Progress.set("turvalisus", "done");
        if (banner) banner.hidden = false;
      }
    }

    shuffle(SCENARIOS).forEach(function (item) {
      const card = document.createElement("article");
      card.className = "data-card";
      card.setAttribute("data-correct", item.correct);

      const p = document.createElement("p");
      p.className = "scenario";
      p.textContent = item.text;
      card.appendChild(p);

      const row = document.createElement("div");
      row.className = "choice-row";
      ["safe", "caution", "danger"].forEach(function (key) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice-btn " + key;
        b.setAttribute("data-choice", key);
        b.innerHTML = LABELS[key].icon + " " + LABELS[key].text;
        row.appendChild(b);
      });
      card.appendChild(row);

      const feedback = document.createElement("div");
      feedback.className = "feedback";
      card.appendChild(feedback);

      row.addEventListener("click", function (e) {
        const btn = e.target.closest(".choice-btn");
        if (!btn || card.classList.contains("answered")) return;
        const choice = btn.getAttribute("data-choice");
        const isCorrect = choice === item.correct;
        card.classList.add("answered", isCorrect ? "correct" : "incorrect");
        row.querySelectorAll(".choice-btn").forEach(function (b) {
          b.disabled = true;
          if (b === btn) b.setAttribute("data-picked", "true");
        });
        feedback.textContent = (isCorrect ? "Õige! " : "Õige vastus oli „" + LABELS[item.correct].text + "“. ") + item.note;
        answered++;
        if (isCorrect) correctCount++;
        updateScore();
      });

      board.appendChild(card);
    });

    updateScore();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
