// ----------------- QUIZ VERSION -----------------
const QUIZ_VERSION = "1.3"; // updated due to performance improvements

// ----------------- STORAGE KEYS -----------------
function getProgressKey(user, level) {
  return `kanjiQuestProgress_${user}_${level}`;
}

function getScoreKey(user, type, level) {
  return `kanjiScore_${type}_${user}_${level}`;
}

function getVersionKey(user) {
  return `kanjiQuestVersion_${user}`;
}

// ----------------- VERSION CHECK & RESET -----------------
function resetQuizData(level) {
  if (!currentUser) return;

  localStorage.removeItem(getProgressKey(currentUser, level));
  localStorage.removeItem(getScoreKey(currentUser, "Correct", level));
  localStorage.removeItem(getScoreKey(currentUser, "Wrong", level));
  localStorage.setItem(getVersionKey(currentUser), QUIZ_VERSION);

  score.correct = 0;
  score.wrong = 0;
  score.total = words.length;
  saveScore("Correct", 0, level);
  saveScore("Wrong", 0, level);
  updateScoreboard();

  console.log(`Quiz reset for level ${level} due to version change.`);
}

function checkQuizVersion(level) {
  if (!currentUser) return;
  const savedVersion = localStorage.getItem(getVersionKey(currentUser));
  if (savedVersion !== QUIZ_VERSION) {
    resetQuizData(level);
  }
}

// ----------------- SCORE DISPLAY -----------------
let correctScoreElement, wrongScoreElement, totalScoreElement, progressBar;

function initScoreElements() {
  correctScoreElement = document.getElementById("correct-score");
  wrongScoreElement = document.getElementById("wrong-score");
  totalScoreElement = document.getElementById("total-score");
  progressBar = document.getElementById("quiz-progress-bar");
}

let score = {
  correct: 0,
  wrong: 0,
  total: 0,
};

// ----------------- SCOREBOARD -----------------
function updateScoreboard() {
  if (correctScoreElement) correctScoreElement.textContent = score.correct;
  if (wrongScoreElement) wrongScoreElement.textContent = score.wrong;
  if (totalScoreElement) totalScoreElement.textContent = score.total;

  const percentage =
    score.total > 0 ? Math.round((currentWordIndex / score.total) * 100) : 0;

  if (progressBar) progressBar.style.width = `${percentage}%`;

  const progressContainer = document.getElementById("quiz-progress");
  if (progressContainer) {
    let label = progressContainer.querySelector(".progress-label");
    if (!label) {
      label = document.createElement("span");
      label.className = "progress-label";
      label.style.position = "relative";
      label.style.zIndex = "2";
      label.style.whiteSpace = "nowrap";
      progressContainer.appendChild(label);
    }
    label.textContent = `進行度: ${percentage}%`;
  }
}

// ----------------- SAVE / LOAD -----------------
function saveProgress(index, level) {
  if (!currentUser) return;
  localStorage.setItem(getProgressKey(currentUser, level), index);
}

function loadProgress(level) {
  if (!currentUser) return 0;
  const saved = parseInt(
    localStorage.getItem(getProgressKey(currentUser, level))
  );
  return !isNaN(saved) ? saved : 0;
}

function saveScore(type, value, level) {
  if (!currentUser) return;
  localStorage.setItem(getScoreKey(currentUser, type, level), value);
}

function loadScore(type, level) {
  if (!currentUser) return 0;
  const saved = parseInt(
    localStorage.getItem(getScoreKey(currentUser, type, level))
  );
  return !isNaN(saved) ? saved : 0;
}

// ----------------- GLOBAL RESET -----------------
window.resetQuizScores = function (level) {
  score.correct = 0;
  score.wrong = 0;
  score.total = words.length;
  saveScore("Correct", 0, level);
  saveScore("Wrong", 0, level);
  updateScoreboard();
};

// ----------------- UTILITIES -----------------
function splitFurigana(furiganaStr) {
  if (!furiganaStr) return [];
  return String(furiganaStr).split(".");
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

// ----------------- WORD DATA -----------------
let words = [];
let currentWordIndex = 0;
let currentLevel = "default";

// ----------------- LOAD WORDS (with Web Worker) -----------------
async function loadWords() {
  try {
    currentLevel =
      localStorage.getItem(`selected-level_${currentUser}`) || "default";

    const csvPath =
      currentLevel === "default"
        ? window.location.pathname.includes("word-details")
          ? "../Custom/quiz_db.csv"
          : "Custom/quiz_db.csv"
        : `${BASE_URL}/JLPT/${currentLevel}.csv`;

    const response = await fetch(csvPath);
    const csvText = await response.text();

    console.time("WorkerParse");
    const workerPath = new URL("./worker-quiz-parser.js", import.meta.url);
    const worker = new Worker(workerPath, { type: "module" });

    worker.postMessage({ csvText });
    worker.onmessage = (e) => {
      words = e.data.words || [];
      score.total = words.length;
      console.timeEnd("WorkerParse");
      console.log(
        `Loaded ${words.length} words from ${currentLevel} (via worker).`
      );
      renderWord();
      updateScoreboard();
    };

    worker.onerror = (err) => {
      console.error("Worker parsing failed:", err);
    };
  } catch (err) {
    console.error("Failed to load words:", err);
  }
}

// ----------------- RENDER WORD -----------------
function renderWord() {
  if (!words || words.length === 0) return;
  const word = words[currentWordIndex];

  const kanjiContainer = document.querySelector(".kanji-container");
  const detailsBox = document.querySelector(".details-box");

  if (kanjiContainer) {
    kanjiContainer.innerHTML = "";

    const furiganaArray = Array.isArray(word.furigana)
      ? word.furigana
      : splitFurigana(word.furigana);

    [...word.kanji].forEach((char, i) => {
      const ruby = document.createElement("ruby");
      ruby.className = "kanji-char";
      ruby.innerHTML = `${char}<rt class="furigana">${
        furiganaArray[i] || ""
      }</rt>`;
      kanjiContainer.appendChild(ruby);
    });
  }

  if (detailsBox) {
    const meaningEl = detailsBox.querySelector(".meaning");
    const exampleEl = detailsBox.querySelector(".example");
    const translationEl = detailsBox.querySelector(".translation");
    const vocabContainer = detailsBox.querySelector(".vocab-words");

    if (vocabContainer) {
      vocabContainer.innerHTML = "";
      if (word.vocabWords && word.vocabWords.length > 0) {
        const limitedWords = word.vocabWords.slice(0, 5);
        limitedWords.forEach((vw, i) => {
          const div = document.createElement("div");
          div.className = "vocab-word";
          div.textContent = vw;
          div.style.animationDelay = `${0.1 * (i + 1)}s`;
          vocabContainer.appendChild(div);
        });
      } else {
        vocabContainer.innerHTML =
          '<p style="color: var(--secondary-color); font-style: italic;">関連語なし</p>';
      }
    }

    if (meaningEl) meaningEl.textContent = `意味：${word.meaning || "空"}`;
    if (exampleEl) exampleEl.textContent = `例文：${word.example || "空"}`;
    if (translationEl)
      translationEl.textContent = `翻訳：${word.translation || "空"}`;
  }

  updateScoreboard();
}

// ----------------- ANSWER CHECK -----------------
function checkAnswer() {
  const inputField = document.querySelector("input");
  if (!inputField) return;

  const input = (inputField.value || "").trim();
  if (input === "") {
    alert("読み方を入力してください！");
    return;
  }

  const word = words[currentWordIndex];
  if (!word) return;

  const correctReading = word.reading.join("").toLowerCase();
  const correctRomaji = normalizeRomaji(word.romaji);
  const normalizedInput = normalizeRomaji(input);
  const kanjiCard = document.querySelector(".kanji-card");
  if (!kanjiCard) return;

  if (
    input.toLowerCase() === correctReading ||
    normalizedInput === correctRomaji
  ) {
    inputField.value = "";
    score.correct++;
    saveScore("Correct", score.correct, currentLevel);
    updateScoreboard();

    kanjiCard.classList.add("slide-right");
    setTimeout(() => {
      nextWord();
      kanjiCard.classList.remove("slide-right");
      kanjiCard.classList.add("slide-in-left");
      setTimeout(() => kanjiCard.classList.remove("slide-in-left"), 600);
    }, 600);
  } else {
    inputField.value = "";
    score.wrong++;
    saveScore("Wrong", score.wrong, currentLevel);
    updateScoreboard();

    kanjiCard.classList.add("shake-wrong");
    setTimeout(() => kanjiCard.classList.remove("shake-wrong"), 600);
  }
}

// ----------------- NEXT WORD -----------------
function nextWord() {
  currentWordIndex++;
  if (currentWordIndex >= words.length) {
    alert("全ての単語を完了しました！");
    currentWordIndex = 0;
  }

  renderWord();
  saveProgress(currentWordIndex, currentLevel);
  updateScoreboard();
}

// ----------------- INITIALIZE QUIZ -----------------
window.addEventListener("DOMContentLoaded", async () => {
  initScoreElements();

  currentLevel =
    localStorage.getItem(`selected-level_${currentUser}`) || "default";
  checkQuizVersion(currentLevel);

  score.correct = loadScore("Correct", currentLevel);
  score.wrong = loadScore("Wrong", currentLevel);

  await loadWords();

  currentWordIndex = loadProgress(currentLevel);
  renderWord();
  updateScoreboard();

  const answerButton = document.querySelector(".answer-button");
  if (answerButton) answerButton.addEventListener("click", checkAnswer);

  const inputField = document.querySelector("input");
  if (inputField) {
    inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
      }
    });
  }
});
