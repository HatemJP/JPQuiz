const THEME_KEY = "kanjiQuestTheme";
const PROGRESS_KEY = "kanjiQuestProgress";
let currentAnimationState = 0;
const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");
const toggleBtn = document.getElementById("toggle-animation-btn");
const wandBtn = document.getElementById("wand-action");

let words = [];
let currentWordIndex = 0;

function navigateWithTransition(url) {
  document.body.classList.add("transition-out");
  setTimeout(() => {
    window.location.href = url;
  }, 400); // matches CSS transition duration
}

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

function adjustKanjiLayout() {
  const kanjiCard = document.querySelector(".kanji-card");
  const kanjiContainer = document.querySelector(".kanji-container");
  if (!kanjiCard || !kanjiContainer) return;

  const kanjiChars = kanjiContainer.querySelectorAll(".kanji-char");
  if (kanjiChars.length === 0) return; // <--- safety check

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

  // Hint button logic
  let currentHintIndex = 0;
  const hintButton = document.querySelector(".hint-button");

  hintButton?.addEventListener("click", () => {
    const furiganaElements = [...document.querySelectorAll(".kanji-char")]
      .filter((ruby) => ruby.querySelector("rt")?.textContent)
      .map((ruby) => ruby.querySelector("rt"))
      .filter((rt) => /[\u4E00-\u9FFF]/.test(rt.parentElement.textContent));

    if (currentHintIndex >= furiganaElements.length) {
      // Reset all
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
    } else {
      const el = furiganaElements[currentHintIndex];

      // Step 1: Make it visible
      el.classList.remove("hidden");

      // Step 2: Wait for next paint to trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add("drop-in");
        });
      });

      currentHintIndex++;
    }

    // Preserve input focus
    const inputField = document.querySelector("input");
    if (inputField && document.activeElement !== inputField) {
      inputField.focus();
    }
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

async function loadWords() {
  try {
    const csvPath = window.location.pathname.includes("word-details")
      ? "../quiz_db.csv"
      : "quiz_db.csv";

    const response = await fetch(csvPath);
    const csvText = await response.text();

    const lines = csvText.trim().split(/\r?\n/);
    const headers = lines
      .shift()
      .split(",")
      .map((h) => h.replace(/"/g, "").trim());

    words = lines.map((line) => {
      const values = line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((v) => v.replace(/^"|"$/g, "").trim());

      const obj = {};
      headers.forEach((header, i) => (obj[header] = values[i]));

      const readingHiragana = obj["Answer"].split(",").join("");
      const romaji = wanakana.toRomaji(readingHiragana);

      return {
        kanji: obj["Question"],
        reading: obj["Answer"].split(","),
        meaning: obj["Meaning"],
        example: obj["Example"],
        translation: obj["Translation"],
        romaji: romaji,
      };
    });

    // Restore progress from localStorage
    const savedIndex = parseInt(localStorage.getItem(PROGRESS_KEY));
    currentWordIndex =
      !isNaN(savedIndex) && savedIndex >= 0 && savedIndex < words.length
        ? savedIndex
        : 0;

    renderWord(); // render after words are loaded
    console.log("Loaded words:", words);
  } catch (err) {
    console.error("Failed to load words from CSV:", err);
  }
}

function splitFurigana(kanji, reading) {
  const kanjiChars = [...kanji];
  const readingChars = [...reading];
  const result = [];

  let readingIndex = 0;

  kanjiChars.forEach((char, i) => {
    // If it's the last kanji, assign all remaining reading
    if (i === kanjiChars.length - 1) {
      result.push(readingChars.slice(readingIndex).join("") || " ");
    } else {
      // Heuristic: assign up to 2 kana per kanji if possible
      // Or use the next small chunk
      const remainingKanji = kanjiChars.length - i;
      const remainingReading = readingChars.length - readingIndex;
      const charsForThisKanji = Math.max(
        1,
        Math.floor(remainingReading / remainingKanji)
      );
      result.push(
        readingChars
          .slice(readingIndex, readingIndex + charsForThisKanji)
          .join("") || " "
      );
      readingIndex += charsForThisKanji;
    }
  });

  return result;
}

/* Override renderWord to use dynamically loaded words */
function renderWord() {
  if (!words || words.length === 0) return;

  const word = words[currentWordIndex];

  // Containers may differ per page
  const kanjiContainer = document.querySelector(".kanji-container");
  const detailsBox = document.querySelector(".details-box");
  const progressText = document.querySelector("#progressBadge span");

  if (!kanjiContainer && !detailsBox) return; // nothing to render

  // === Kanji + Furigana ===
  if (kanjiContainer) {
    kanjiContainer.innerHTML = "";
    const furiganaArray = splitFurigana(word.kanji, word.reading.join(""));

    [...word.kanji].forEach((char, i) => {
      const ruby = document.createElement("ruby");
      ruby.className = "kanji-char";
      ruby.innerHTML = `${char}<rt class="furigana hidden">${
        furiganaArray[i] || ""
      }</rt>`;
      kanjiContainer.appendChild(ruby);
    });

    adjustKanjiLayout();
  }

  // === Details Box ===
  if (detailsBox) {
    const kanjiTitle = detailsBox.querySelector(".kanji-title");
    const meaningEl = detailsBox.querySelector(".meaning");
    const exampleEl = detailsBox.querySelector(".example");
    const translationEl = detailsBox.querySelector(".translation");

    if (kanjiTitle) {
      kanjiTitle.innerHTML = `${
        word.kanji
      } <span class="reading">（${word.reading.join("")}）</span>`;
    }

    if (meaningEl) meaningEl.textContent = `意味：${word.meaning || "空"}`;
    if (exampleEl) exampleEl.textContent = `例文：${word.example || "空"}`;
    if (translationEl)
      translationEl.textContent = `翻訳：${word.translation || "空"}`;
  }

  // === Reset progress badge ===
  const progressFill = document.getElementById("progressFill");
  if (progressFill) progressFill.style.width = "0%";
  if (progressText) progressText.textContent = `進行度: 0%`;
}

/* Call loadWords when DOM is ready */
window.addEventListener("DOMContentLoaded", () => {
  loadWords();
});

function nextWord() {
  currentWordIndex = (currentWordIndex + 1) % words.length;
  renderWord();
  localStorage.setItem(PROGRESS_KEY, currentWordIndex); // save progress
}

function normalizeRomaji(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/ā/g, "a")
    .replace(/ī/g, "i")
    .replace(/ū/g, "u")
    .replace(/ē/g, "e")
    .replace(/ō/g, "o");
}

function checkAnswer() {
  const inputField = document.querySelector("input");
  const input = (inputField?.value || "").trim().toLowerCase();
  const word = words[currentWordIndex];

  if (!word) return;

  const correctReading = word.reading.join("").toLowerCase();
  const correctRomaji = normalizeRomaji(word.romaji);

  const kanjiCard = document.querySelector(".kanji-card");
  if (!kanjiCard) return;

  const normalizedInput = normalizeRomaji(input);

  if (input === correctReading || normalizedInput === correctRomaji) {
    if (inputField) inputField.value = ""; // clear input
    kanjiCard.classList.add("slide-right");
    setTimeout(() => {
      nextWord();
      kanjiCard.classList.remove("slide-right");
      kanjiCard.classList.add("slide-in-left");
      setTimeout(() => kanjiCard.classList.remove("slide-in-left"), 600);
    }, 600);
  } else {
    if (inputField) inputField.value = ""; // clear wrong input
    kanjiCard.classList.add("shake-wrong");
    setTimeout(() => kanjiCard.classList.remove("shake-wrong"), 600);
  }
}

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
