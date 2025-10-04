const currentUser = localStorage.getItem("currentUser");
let words = [];
let currentWordIndex = 0;

// ----------------- STORAGE KEYS -----------------
function getProgressKey(user) {
  return `kanjiQuestProgress_${user}`;
}

function getScoreKey(user, type) {
  return `kanjiScore_${type}_${user}`;
}

function getShuffledKey(user) {
  return `kanjiQuestShuffled_${user}`;
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

function saveShuffledOrder(order) {
  if (!currentUser) return;
  localStorage.setItem(getShuffledKey(currentUser), JSON.stringify(order));
}

function loadShuffledOrder() {
  if (!currentUser) return null;
  const saved = localStorage.getItem(getShuffledKey(currentUser));
  return saved ? JSON.parse(saved) : null;
}

// ----------------- SCORE DISPLAY -----------------
const correctScoreElement = document.getElementById("correct-score");
const wrongScoreElement = document.getElementById("wrong-score");

let score = {
  correct: loadScore("Correct"),
  wrong: loadScore("Wrong"),
};

function updateScoreboard() {
  correctScoreElement && (correctScoreElement.textContent = score.correct);
  wrongScoreElement && (wrongScoreElement.textContent = score.wrong);
}

// ----------------- LOAD QUIZ WORDS -----------------
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

    const allWords = lines.map((line) => {
      const values = line
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((v) => v.replace(/^"|"$/g, "").trim());

      const obj = {};
      headers.forEach((header, i) => (obj[header] = values[i]));

      return {
        kanji: obj["Question"],
        reading: obj["Answer"].split(","),
        furigana: splitFurigana(obj["Furigana"]),
        meaning: obj["Meaning"],
        example: obj["Example"],
        translation: obj["Translation"],
        romaji: wanakana.toRomaji(obj["Answer"].replace(/,/g, "")),
      };
    });

    let shuffled = loadShuffledOrder();
    if (!shuffled) {
      shuffled = shuffleArray([...Array(allWords.length).keys()]);
      saveShuffledOrder(shuffled);
    }

    words = shuffled.map((i) => allWords[i]);
  } catch (err) {
    console.error("Failed to load words from CSV:", err);
  }
}

// ----------------- UTILS -----------------
function splitFurigana(furiganaStr) {
  if (!furiganaStr) return [];
  return String(furiganaStr).split(".");
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ----------------- RENDER WORD -----------------
function renderWord() {
  if (!words || words.length === 0) return;
  const word = words[currentWordIndex];

  const kanjiContainer = document.querySelector(".kanji-container");
  const detailsBox = document.querySelector(".details-box");
  const progressText = document.querySelector("#progressBadge span");

  if (kanjiContainer) {
    kanjiContainer.innerHTML = "";

    const furiganaArray = Array.isArray(word.furigana)
      ? word.furigana
      : splitFurigana(word.furigana);

    [...word.kanji].forEach((char, i) => {
      const ruby = document.createElement("ruby");
      ruby.className = "kanji-char";
      ruby.innerHTML = `${char}<rt class="furigana hidden">${
        furiganaArray[i] || ""
      }</rt>`;
      kanjiContainer.appendChild(ruby);
    });
  }

  adjustKanjiLayout();

  if (detailsBox) {
    const kanjiTitle = detailsBox.querySelector(".kanji-title");
    const meaningEl = detailsBox.querySelector(".meaning");
    const exampleEl = detailsBox.querySelector(".example");
    const translationEl = detailsBox.querySelector(".translation");

    if (kanjiTitle)
      kanjiTitle.innerHTML = `${
        word.kanji
      } <span class="reading">（${word.reading.join("")}）</span>`;
    if (meaningEl) meaningEl.textContent = `意味：${word.meaning || "空"}`;
    if (exampleEl) exampleEl.textContent = `例文：${word.example || "空"}`;
    if (translationEl)
      translationEl.textContent = `翻訳：${word.translation || "空"}`;
  }

  if (progressText)
    progressText.textContent = `進行度: ${Math.floor(
      (currentWordIndex / words.length) * 100
    )}%`;

  adjustKanjiLayout();
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
  const input = (inputField?.value || "").trim().toLowerCase();
  const word = words[currentWordIndex];
  if (!word) return;

  const correctReading = word.reading.join("").toLowerCase();
  const correctRomaji = normalizeRomaji(word.romaji);
  if (!inputField) return;
  const normalizedInput = normalizeRomaji(input);
  const kanjiCard = document.querySelector(".kanji-card");
  if (!kanjiCard) return;

  if (input === correctReading || normalizedInput === correctRomaji) {
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
function nextWord(correct = true) {
  const currentIndex = currentWordIndex;

  if (correct) {
    words.splice(currentWordIndex, 1);
    const shuffled = loadShuffledOrder();
    shuffled.splice(currentIndex, 1);
    saveShuffledOrder(shuffled);
  } else {
    score.wrong++;
    saveScore("Wrong", score.wrong);
  }

  if (words.length === 0) {
    alert("全ての単語を完了しました！");
    return;
  }

  currentWordIndex = currentWordIndex % words.length;

  renderWord();
  updateScoreboard();
  saveProgress(currentUser ? currentWordIndex : 0);
}

// ----------------- INITIALIZE QUIZ -----------------
window.addEventListener("DOMContentLoaded", () => {
  const kanjiContainer = document.querySelector(".kanji-container");

  loadWords().then(() => {
    currentWordIndex = loadProgress();
    score.correct = loadScore("Correct");
    score.wrong = loadScore("Wrong");
    renderWord();
    updateScoreboard();
    adjustKanjiLayout();
  });

  if (kanjiContainer) {
    const observer = new MutationObserver(adjustKanjiLayout);
    observer.observe(kanjiContainer, { childList: true, subtree: true });
  }
});
