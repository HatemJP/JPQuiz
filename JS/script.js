const THEME_KEY = "kanjiQuestTheme";
let currentAnimationState = 0; // 0 = none, 1 = snow, 2 = sakura

const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");

const toggleBtn = document.getElementById("toggle-animation-btn");
const wandBtn = document.getElementById("wand-action");

/* ========= Animation Logic ========= */
function startAnimation(state) {
  document.body.classList.remove("snow-active", "sakura-active");
  if (state === 1) {
    document.body.classList.add("snow-active");
    window.startSnow?.();
    window.stopSakura?.();
  } else if (state === 2) {
    document.body.classList.add("sakura-active");
    window.startSakura?.();
    window.stopSnow?.();
  } else {
    window.stopSnow?.();
    window.stopSakura?.();
  }
}

function syncAnimationButtons(state) {
  toggleBtn?.classList.remove("snow-retrigger", "sakura-retrigger");
  wandBtn?.classList.remove("snow-retrigger", "sakura-retrigger");

  const toggleIcon = toggleBtn?.querySelector("i");
  const wandIcon = wandBtn?.querySelector("i");
  if (!toggleIcon || !wandIcon) return;

  toggleIcon.classList.add("fade-out");
  wandIcon.classList.add("fade-out");

  setTimeout(() => {
    if (state === 1) {
      toggleBtn.classList.add("snow-retrigger");
      wandBtn.classList.add("snow-retrigger");
      toggleIcon.className = "fas fa-snowflake";
      wandIcon.className = "fas fa-snowflake";
    } else if (state === 2) {
      toggleBtn.classList.add("sakura-retrigger");
      wandBtn.classList.add("sakura-retrigger");
      toggleIcon.className = "fas fa-seedling";
      wandIcon.className = "fas fa-seedling";
    } else {
      toggleIcon.className = "fas fa-magic";
      wandIcon.className = "fa-solid fa-wand-magic-sparkles";
    }
    toggleIcon.classList.remove("fade-out");
    wandIcon.classList.remove("fade-out");
  }, 300);
}

function toggleAnimation() {
  currentAnimationState = (currentAnimationState + 1) % 3;
  startAnimation(currentAnimationState);
  syncAnimationButtons(currentAnimationState);
}

toggleBtn?.addEventListener("click", toggleAnimation);
wandBtn?.addEventListener("click", toggleAnimation);

mainActionBtn?.addEventListener("click", () => {
  if (!mainActionBtn.disabled) {
    actionWrapper.classList.toggle("active");
    mainActionBtn.classList.toggle(
      "menu-open",
      actionWrapper.classList.contains("active")
    );
  }
});

document.querySelectorAll(".sub-action").forEach((btn) => {
  btn.addEventListener("click", () => {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  });
});

document.addEventListener("click", (event) => {
  if (
    !actionWrapper?.contains(event.target) &&
    !themeModal?.contains(event.target)
  ) {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  }
});

function navigateTo(url) {
  if (url === "index.html") window.location.href = "../index.html";
  else window.location.href = `HTML/${url}`;
}

function openThemeModal() {
  actionWrapper?.classList.remove("active");
  mainActionBtn?.classList.remove("menu-open");
  themeModal?.classList.add("active");
  if (mainActionBtn) mainActionBtn.disabled = true;
}

function closeThemeModal() {
  themeModal?.classList.remove("active");
  if (mainActionBtn) mainActionBtn.disabled = false;
}

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".main-navbar");
  const container = document.querySelector(".container");

  if (!navbar) return;

  if (window.scrollY === 0) {
    navbar.classList.remove("hidden");
    container?.classList.remove("hidden");
  } else {
    navbar.classList.add("hidden");
    container?.classList.add("hidden");
  }
});

function setTheme(themeName) {
  const body = document.body;
  body.className = [...body.classList]
    .filter((cls) => !cls.startsWith("theme-"))
    .join(" ");
  body.classList.add(themeName);
  localStorage.setItem(THEME_KEY, themeName);

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === themeName);
  });

  closeThemeModal();
}

/* ========= Kanji Quiz Data ========= */
const words = [
  { kanji: "漢字", reading: ["かん", "じ"], romaji: "kanji" },
  { kanji: "日本", reading: ["に", "ほん"], romaji: "nihon" },
  { kanji: "学校", reading: ["がっ", "こう"], romaji: "gakkou" },
  { kanji: "先生", reading: ["せん", "せい"], romaji: "sensei" },
];
let currentWordIndex = 0;

function renderWord() {
  const word = words[currentWordIndex];
  const kanjiContainer = document.querySelector(".kanji-container");
  if (!kanjiContainer) return;
  kanjiContainer.innerHTML = "";
  [...word.kanji].forEach((char, i) => {
    const ruby = document.createElement("ruby");
    ruby.className = "kanji-char";
    ruby.innerHTML = `${char}<rt class="furigana hidden">${word.reading[i]}</rt>`;
    kanjiContainer.appendChild(ruby);
  });
  adjustKanjiLayout();
}

function nextWord() {
  currentWordIndex = (currentWordIndex + 1) % words.length;
  renderWord();
}

function checkAnswer() {
  const inputField = document.querySelector("input");
  const input = inputField?.value.trim().toLowerCase();
  const word = words[currentWordIndex];
  const correctReading = word.reading.join("").toLowerCase();
  const correctRomaji = word.romaji.toLowerCase();
  const kanjiCard = document.querySelector(".kanji-card");

  if (!kanjiCard) return;

  if (input === correctReading || input === correctRomaji) {
    if (inputField) inputField.value = ""; // clear immediately
    kanjiCard.classList.add("slide-right");
    setTimeout(() => {
      nextWord();
      kanjiCard.classList.remove("slide-right");
      kanjiCard.classList.add("slide-in-left");
      setTimeout(() => kanjiCard.classList.remove("slide-in-left"), 600);
    }, 600);
  } else {
    if (inputField) inputField.value = ""; // clear wrong input immediately
    kanjiCard.classList.add("shake-wrong");
    setTimeout(() => kanjiCard.classList.remove("shake-wrong"), 600);
  }
}

/* ========= DOM Ready ========= */
window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && !body.classList.contains(savedTheme)) {
    body.classList.add(savedTheme);
  }

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === savedTheme);
  });

  // Hint button
  let currentHintIndex = 0;
  const hintButton = document.querySelector(".hint-button");
  hintButton?.addEventListener("click", () => {
    const furiganaElements = [...document.querySelectorAll(".furigana")];
    if (currentHintIndex >= furiganaElements.length) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
    } else {
      const el = furiganaElements[currentHintIndex];
      el.classList.remove("hidden");
      el.classList.add("drop-in");
      currentHintIndex++;
    }
    hintButton.blur();
  });

  const jishoButton = document.querySelector(".jisho-button");
  const answerButton = document.querySelector(".answer-button");

  const isDetailPage = window.location.pathname.includes("word-details");
  const isIndexPage =
    window.location.pathname.includes("index.html") ||
    window.location.pathname.endsWith("/");

  jishoButton?.addEventListener("click", () => {
    if (isIndexPage) {
      const kanjiChars = [...document.querySelectorAll(".kanji-char")]
        .map((el) => el.childNodes[0].nodeValue.trim())
        .join("");
      const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(
        kanjiChars
      )}`;
      window.open(url, "_blank");
      jishoButton.blur();
    }
  });

  answerButton?.addEventListener("click", () => {
    checkAnswer();
    answerButton.blur();
  });

  // Enter key triggers answer check
  const inputField = document.querySelector("input");
  inputField?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  themeModal?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeThemeModal();
  });

  const kanjiContainer = document.querySelector(".kanji-container");
  kanjiContainer?.addEventListener("click", () => {
    body.classList.add("transition-out");
    setTimeout(() => {
      if (isDetailPage) window.location.href = "../index.html";
      else if (isIndexPage) window.location.href = "HTML/word-details.html";
    }, 400);
  });

  if (isDetailPage) {
    document.querySelectorAll(".kanji-char").forEach((kanjiEl) => {
      kanjiEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const kanjiChars = [...document.querySelectorAll(".kanji-char")]
          .map((el) => el.childNodes[0].nodeValue.trim())
          .join("");
        const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(
          kanjiChars
        )}`;
        window.open(url, "_blank");
      });
    });
  } else if (isIndexPage) {
    document.querySelectorAll(".kanji-char").forEach((kanjiEl) => {
      kanjiEl.addEventListener("click", (e) => e.stopPropagation());
    });
  }

  renderWord();
  adjustKanjiLayout();

  const observer = kanjiContainer
    ? new MutationObserver(adjustKanjiLayout)
    : null;
  observer?.observe(kanjiContainer, { childList: true, subtree: true });
});

function adjustKanjiLayout() {
  const kanjiCard = document.querySelector(".kanji-card");
  const kanjiContainer = document.querySelector(".kanji-container");
  if (!kanjiCard || !kanjiContainer) return;

  const kanjiChars = kanjiContainer.querySelectorAll(".kanji-char");
  kanjiContainer.style.padding = "1rem 2rem";
  kanjiContainer.style.flexWrap = "wrap";

  kanjiChars.forEach((el) => (el.style.fontSize = ""));
  const maxWidth = window.innerWidth * 0.95;
  let containerRect = kanjiContainer.getBoundingClientRect();
  let fontSize = parseFloat(getComputedStyle(kanjiChars[0]).fontSize);

  while (containerRect.width > maxWidth && fontSize > 1.2) {
    fontSize -= 0.1;
    kanjiChars.forEach((el) => (el.style.fontSize = fontSize + "px"));
    containerRect = kanjiContainer.getBoundingClientRect();
  }
}

window.addEventListener("resize", adjustKanjiLayout);

/* Optional scoring system (kept from new script.js)
const correctScoreElement = document.getElementById("correct-score");
const wrongScoreElement = document.getElementById("wrong-score");

let score = {
  correct: parseInt(localStorage.getItem("kanjiScoreCorrect")) || 0,
  wrong: parseInt(localStorage.getItem("kanjiScoreWrong")) || 0
};

function updateScoreboard() {
  correctScoreElement.textContent = score.correct;
  wrongScoreElement.textContent = score.wrong;
  localStorage.setItem("kanjiScoreCorrect", score.correct);
  localStorage.setItem("kanjiScoreWrong", score.wrong);
}

answerButton?.addEventListener("click", () => {
  const isCorrect = 0; // placeholder
  if (isCorrect) score.correct++;
  else score.wrong++;
  updateScoreboard();
  answerButton.blur();
});

updateScoreboard();
*/
