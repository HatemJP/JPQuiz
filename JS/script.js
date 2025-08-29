const THEME_KEY = "kanjiQuestTheme";
let currentAnimationState = 0;

const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");

// Toggle sub-actions on click
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

function toggleAnimation() {
  const toggleBtn = document.getElementById("toggle-animation-btn");
  if (!toggleBtn) return;

  currentAnimationState = (currentAnimationState + 1) % 3;

  toggleBtn.classList.remove("snow-retrigger", "sakura-retrigger");

  if (currentAnimationState === 1) {
    window.startSnow?.();
    window.stopSakura?.();
    toggleBtn.classList.add("snow-retrigger");
    toggleBtn.textContent = "雪舞";
  } else if (currentAnimationState === 2) {
    window.startSakura?.();
    window.stopSnow?.();
    toggleBtn.classList.add("sakura-retrigger");
    toggleBtn.textContent = "桜舞";
  } else {
    window.stopSnow?.();
    window.stopSakura?.();
    toggleBtn.textContent = "舞";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && !body.classList.contains(savedTheme)) {
    body.classList.add(savedTheme);
  }

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === savedTheme);
  });

  const furiganaElements = [...document.querySelectorAll(".furigana")];
  let currentHintIndex = 0;
  const hintButton = document.querySelector(".controls button:nth-child(1)");
  hintButton?.addEventListener("click", () => {
    if (currentHintIndex >= furiganaElements.length) {
      furiganaElements.forEach((el) => (el.style.visibility = "hidden"));
      currentHintIndex = 0;
    } else {
      furiganaElements[currentHintIndex].style.visibility = "visible";
      currentHintIndex++;
    }
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

  answerButton?.addEventListener("click", () => {
    alert("答えるボタンの機能は未だ実装されていません。");
    answerButton.blur();
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

/* Optional scoring system
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
