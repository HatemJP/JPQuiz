const THEME_KEY = "kanjiQuestTheme";

function setTheme(themeName) {
  document.body.className = themeName;
  localStorage.setItem(THEME_KEY, themeName);
  document.querySelector(".theme-modal").classList.remove("active");
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) document.body.className = savedTheme;

  const hintButton = document.querySelector(".controls button:nth-child(1)");
  const furiganaElements = [...document.querySelectorAll(".furigana")];
  let currentHintIndex = 0;

  furiganaElements.forEach((el) => (el.style.visibility = "hidden"));

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

  const jishoButton = document.querySelector(".controls button:nth-child(2)");
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

  // const correctScoreElement = document.getElementById("correct-score");
  // const wrongScoreElement = document.getElementById("wrong-score");
  const answerButton = document.querySelector(".controls button:nth-child(3)");
  answerButton.addEventListener("click", () => {
    alert("答えるボタンの機能は未だ実装されていません。");
    answerButton.blur();
  });

  // let score = {
  //     correct: parseInt(localStorage.getItem("kanjiScoreCorrect")) || 0,
  //     wrong: parseInt(localStorage.getItem("kanjiScoreWrong")) || 0
  // };

  // function updateScoreboard() {
  //     correctScoreElement.textContent = score.correct;
  //     wrongScoreElement.textContent = score.wrong;
  //     localStorage.setItem("kanjiScoreCorrect", score.correct);
  //     localStorage.setItem("kanjiScoreWrong", score.wrong);
  // }

  // answerButton.addEventListener("click", () => {
  //     const isCorrect = 0; // sample
  //     if (isCorrect) score.correct++;
  //     else score.wrong++;
  //     updateScoreboard();
  //     answerButton.blur();
  // });

  // updateScoreboard();
});

document.querySelector(".theme-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove("active");
});
