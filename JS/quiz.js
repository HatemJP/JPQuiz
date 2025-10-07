// ----------------- QUIZ VERSION -----------------
const QUIZ_VERSION = "1";

// ----------------- STORAGE KEYS -----------------
function getProgressKey(user) {
  return `kanjiQuestProgress_${user}`;
}

function getScoreKey(user, type) {
  return `kanjiScore_${type}_${user}`;
}

function getVersionKey(user) {
  return `kanjiQuestVersion_${user}`;
}

// ----------------- VERSION CHECK & RESET -----------------
function resetQuizData() {
  if (!currentUser) return;

  localStorage.removeItem(getProgressKey(currentUser));
  localStorage.removeItem(getScoreKey(currentUser, "Correct"));
  localStorage.removeItem(getScoreKey(currentUser, "Wrong"));
  localStorage.setItem(getVersionKey(currentUser), QUIZ_VERSION);

  // Reset in-memory score
  score.correct = 0;
  score.wrong = 0;
  score.total = words.length;
  saveScore("Correct", 0);
  saveScore("Wrong", 0);
  updateScoreboard();

  console.log("Quiz localStorage reset due to version change.");
}

function checkQuizVersion() {
  if (!currentUser) return;
  const savedVersion = localStorage.getItem(getVersionKey(currentUser));
  if (savedVersion !== QUIZ_VERSION) {
    resetQuizData();
  }
}

// ----------------- SCORE DISPLAY -----------------
let correctScoreElement, wrongScoreElement, totalScoreElement;

function initScoreElements() {
  correctScoreElement = document.getElementById("correct-score");
  wrongScoreElement = document.getElementById("wrong-score");
  totalScoreElement = document.getElementById("total-score");
}

let score = {
  correct: 0,
  wrong: 0,
  total: 0, // total words in CSV/custom file, never changes
};

function updateScoreboard() {
  if (!correctScoreElement || !wrongScoreElement || !totalScoreElement) return;
  correctScoreElement.textContent = score.correct;
  wrongScoreElement.textContent = score.wrong;
  totalScoreElement.textContent = score.total;
}

// ----------------- PROGRESS & SCORE -----------------
function saveProgress(index) {
  if (!currentUser) return;
  localStorage.setItem(getProgressKey(currentUser), index);
}

function loadProgress() {
  if (!currentUser) return 0;
  const saved = parseInt(localStorage.getItem(getProgressKey(currentUser)));
  return !isNaN(saved) ? saved : 0;
}

function saveScore(type, value) {
  if (!currentUser) return;
  localStorage.setItem(getScoreKey(currentUser, type), value);
}

function loadScore(type) {
  if (!currentUser) return 0;
  const saved = parseInt(localStorage.getItem(getScoreKey(currentUser, type)));
  return !isNaN(saved) ? saved : 0;
}

// ----------------- GLOBAL RESET FUNCTION -----------------
window.resetQuizScores = function () {
  score.correct = 0;
  score.wrong = 0;
  score.total = words.length;
  saveScore("Correct", 0);
  saveScore("Wrong", 0);
  updateScoreboard();
};

// ----------------- UTILS -----------------
function splitFurigana(furiganaStr) {
  if (!furiganaStr) return [];
  return String(furiganaStr).split(".");
}

// ----------------- LOAD QUIZ WORDS -----------------
let words = [];
let currentWordIndex = 0;

async function loadWords() {
  try {
    let csvText = null;

    const listSource =
      localStorage.getItem(`listSource_${currentUser}`) || "default";

    if (listSource === "custom") {
      const customText = localStorage.getItem(`customQuizFile_${currentUser}`);
      if (!customText) {
        alert(
          "カスタム単語リストが見つかりません。デフォルトリストを使用します。"
        );
      } else {
        csvText = customText;
      }
    }

    if (!csvText) {
      const csvPath = window.location.pathname.includes("word-details")
        ? "../quiz_db.csv"
        : "quiz_db.csv";
      const response = await fetch(csvPath);
      csvText = await response.text();
    }

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
      headers.forEach((h, i) => (obj[h] = values[i]));
      return {
        kanji: obj["Question"],
        reading: obj["Answer"].split(","),
        furigana: splitFurigana(obj["Furigana"]),
        meaning: obj["Meaning"],
        example: obj["Example"],
        translation: obj["Translation"],
        romaji: wanakana.toRomaji(obj["Answer"].replace(/,/g, "")),
        vocabWords: obj["VocabWords"]
          ? obj["VocabWords"].split(",").map((w) => w.trim())
          : [],
      };
    });

    score.total = words.length;
    updateScoreboard();
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
        const limitedWords = word.vocabWords.slice(0, 5); // limit to 5 words max
        limitedWords.forEach((vw, i) => {
          const div = document.createElement("div");
          div.className = "vocab-word";
          div.textContent = vw;
          div.style.animationDelay = `${0.1 * (i + 1)}s`;
          vocabContainer.appendChild(div);
        });
      } else {
        vocabContainer.innerHTML =
          '<p style="color: var(--muted); font-style: italic;">関連語なし</p>';
      }
    }

    if (meaningEl) meaningEl.textContent = `意味：${word.meaning || "空"}`;
    if (exampleEl) exampleEl.textContent = `例文：${word.example || "空"}`;
    if (translationEl)
      translationEl.textContent = `翻訳：${word.translation || "空"}`;
  }

  adjustKanjiLayout?.();
}

// ----------------- ROMAJI NORMALIZATION -----------------
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
    saveScore("Correct", score.correct);
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
    saveScore("Wrong", score.wrong);
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
  updateScoreboard();
  saveProgress(currentWordIndex);
}

// ----------------- INITIALIZE QUIZ -----------------
window.addEventListener("DOMContentLoaded", async () => {
  checkQuizVersion();

  initScoreElements();

  // Load scores
  score.correct = loadScore("Correct");
  score.wrong = loadScore("Wrong");

  await loadWords();

  currentWordIndex = loadProgress();
  renderWord();
  updateScoreboard();

  const kanjiContainer = document.querySelector(".kanji-container");
  if (kanjiContainer) {
    const observer = new MutationObserver(adjustKanjiLayout);
    observer.observe(kanjiContainer, { childList: true, subtree: true });
  }

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
