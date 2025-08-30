const THEME_KEY = "kanjiQuestTheme";
let currentAnimationState = 0; // 0 = none, 1 = snow, 2 = sakura

const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");

const toggleBtn = document.getElementById("toggle-animation-btn");
const wandBtn = document.getElementById("wand-action");

let currentHintIndex = 0; // global for hints

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

/* ========= Sync Button States ========= */
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

/* ========= Toggle Function ========= */
function toggleAnimation() {
  currentAnimationState = (currentAnimationState + 1) % 3;
  startAnimation(currentAnimationState);
  syncAnimationButtons(currentAnimationState);
}

/* ========= Event Listeners ========= */
toggleBtn?.addEventListener("click", toggleAnimation);
wandBtn?.addEventListener("click", toggleAnimation);

// Toggle sub-actions
mainActionBtn?.addEventListener("click", () => {
  if (!mainActionBtn.disabled) {
    actionWrapper.classList.toggle("active");
    mainActionBtn.classList.toggle(
      "menu-open",
      actionWrapper.classList.contains("active")
    );
  }
});

// Close sub-actions when any option is clicked
document.querySelectorAll(".sub-action").forEach((btn) => {
  btn.addEventListener("click", () => {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  });
});

// Close sub-actions when clicking outside
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

/* ========= Hint Button Logic ========= */
function resetHints() {
  const furiganaElements = document.querySelectorAll(
    ".kanji-container .furigana"
  );
  furiganaElements.forEach((el) => (el.style.visibility = "hidden"));
  currentHintIndex = 0;
}

function showNextHint() {
  const furiganaElements = document.querySelectorAll(
    ".kanji-container .furigana"
  );
  if (furiganaElements.length === 0) return;

  if (currentHintIndex >= furiganaElements.length) {
    resetHints();
  } else {
    furiganaElements[currentHintIndex].style.visibility = "visible";
    currentHintIndex++;
  }
}

/* ========= Kanji Quiz Logic ========= */
const answerBtn = document.getElementById("answer-btn");
const kanjiContainer = document.getElementById("kanji-container");
const answerInput = document.getElementById("answer-input");

// Example word list (kanji + furigana)
const words = [
  { kanji: "漢字", furigana: ["かん", "じ"] },
  { kanji: "日本", furigana: ["に", "ほん"] },
  { kanji: "学習", furigana: ["がく", "しゅう"] },
  { kanji: "冒険", furigana: ["ぼう", "けん"] },
];
let currentIndex = 0;

// Function to render a kanji word
function renderWord(wordObj) {
  const rubyWrapper = kanjiContainer.querySelector(".ruby-wrapper");
  rubyWrapper.innerHTML = "";
  for (let i = 0; i < wordObj.kanji.length; i++) {
    const ruby = document.createElement("ruby");
    ruby.className = "kanji-char";
    ruby.innerHTML =
      wordObj.kanji[i] + `<rt class="furigana">${wordObj.furigana[i]}</rt>`;
    rubyWrapper.appendChild(ruby);
  }
  resetHints();
}

// Initialize first word
renderWord(words[currentIndex]);

answerBtn?.addEventListener("click", () => {
  // Animate kanji flying out
  kanjiContainer.classList.add("correct-animate");

  // After animation, reset and show next word with slide-in
  setTimeout(() => {
    kanjiContainer.classList.remove("correct-animate");
    answerInput.value = "";

    // Increment word index
    currentIndex = (currentIndex + 1) % words.length;
    renderWord(words[currentIndex]);

    // Animate slide-in
    kanjiContainer.classList.add("new-word");
    setTimeout(() => {
      kanjiContainer.classList.remove("new-word");
    }, 700);
  }, 900); // match throw animation duration
});

/* ========= DOMContentLoaded ========= */
window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && !body.classList.contains(savedTheme)) {
    body.classList.add(savedTheme);
  }

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === savedTheme);
  });

  const hintButton = document.getElementById("hint-btn");
  hintButton?.addEventListener("click", () => {
    showNextHint();
    hintButton.blur();
  });

  const jishoButton = document.querySelector(".controls button:nth-child(2)");
  const answerButton = document.querySelector(".controls button:nth-child(3)");

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

  themeModal?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeThemeModal();
  });

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

  adjustKanjiLayout();

  if (kanjiContainer) {
    const observer = new MutationObserver(() => {
      adjustKanjiLayout();
      resetHints(); // reset hints whenever kanji content changes
    });
    observer.observe(kanjiContainer, { childList: true, subtree: true });
  }
});

/* ========= Kanji Layout ========= */
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

/* Optional scoring system (commented out)
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
