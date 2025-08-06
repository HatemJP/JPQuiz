const THEME_KEY = "kanjiQuestTheme";

function setTheme(themeName) {
  const body = document.body;
  // Remove any existing theme-* classes but keep sakura-on
  body.className = [...body.classList]
    .filter((cls) => !cls.startsWith("theme-"))
    .join(" "); // remove existing theme-*

  // Add the new theme class
  body.classList.add(themeName);

  localStorage.setItem(THEME_KEY, themeName);
  document.querySelector(".theme-modal").classList.remove("active");
}

function openThemeModal() {
  document.querySelector(".settings-modal").classList.remove("active");
  document.querySelector(".theme-modal").classList.add("active");
}

function toggleSnowAnimation() {
  const sakuraContainer = document.querySelector(".snow-animation");
  const toggleBtn = document.getElementById("toggle-snow-btn");

  if (!sakuraContainer || !toggleBtn) return;

  const isVisible = sakuraContainer.style.display !== "none";

  if (isVisible) {
    sakuraContainer.style.display = "none";
    document.body.classList.remove("snow-on");
    toggleBtn.style.setProperty("--fill-width", "0%");
  } else {
    sakuraContainer.style.display = "block";
    document.body.classList.remove("snow-on");
    void toggleBtn.offsetWidth;
    document.body.classList.add("snow-on");
    toggleBtn.style.setProperty("--fill-width", "100%");
  }
}

function closeSettingsModal() {
  document.querySelector(".settings-modal").classList.remove("active");
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.body.className = savedTheme;

  const furiganaElements = [...document.querySelectorAll(".furigana")];
  furiganaElements.forEach((el) => (el.style.visibility = "hidden"));
  let currentHintIndex = 0;

  const hintButton = document.querySelector(".controls button:nth-child(1)");
  if (hintButton) {
    hintButton.addEventListener("click", () => {
      if (currentHintIndex >= furiganaElements.length) {
        furiganaElements.forEach((el) => (el.style.visibility = "hidden"));
        currentHintIndex = 0;
      } else {
        furiganaElements[currentHintIndex].style.visibility = "visible";
        currentHintIndex++;
      }
      hintButton.blur();
    });
  }

  const jishoButton = document.querySelector(".controls button:nth-child(2)");
  if (jishoButton) {
    const kanjiChars = [...document.querySelectorAll(".kanji-char")]
      .map((el) => el.textContent)
      .join("");
    jishoButton.addEventListener("click", () => {
      const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(
        kanjiChars
      )}`;
      window.open(url, "_blank");
      jishoButton.blur();
    });
  }

  const answerButton = document.querySelector(".controls button:nth-child(3)");
  if (answerButton) {
    answerButton.addEventListener("click", () => {
      alert("答えるボタンの機能は未だ実装されていません。");
      answerButton.blur();
    });
  }

  const themeModal = document.querySelector(".theme-modal");
  if (themeModal) {
    themeModal.addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        e.currentTarget.classList.remove("active");
      }
    });
  }

  const kanjiContainer = document.querySelector(".kanji-container");
  if (kanjiContainer) {
    kanjiContainer.addEventListener("click", () => {
      document.body.classList.add("transition-out");
      setTimeout(() => {
        const isDetailPage = window.location.pathname.includes("word-details");
        const targetPage = isDetailPage ? "index.html" : "word-details.html";
        window.location.href = targetPage;
      }, 400);
    });
  }
});

// Optional: Uncomment below to enable scoring system later
/*
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
