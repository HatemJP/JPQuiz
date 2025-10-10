const BASE_URL =
  window.location.hostname === "hatemjp.github.io"
    ? "https://hatemjp.github.io/JPQuiz"
    : "";

const currentUser = localStorage.getItem("current-user");
const THEME_KEY = "kanjiQuestTheme";
const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");

if (!currentUser && !window.location.pathname.includes("login.html")) {
  window.location.replace(`${BASE_URL}/HTML/login.html`);
}

// ----------------- NAVIGATION -----------------
function navigateWithTransition(relativeUrl) {
  let fullUrl = relativeUrl;

  // Only prepend BASE_URL if it's a relative path
  if (!/^https?:\/\//.test(relativeUrl) && !relativeUrl.startsWith("/")) {
    fullUrl = `${BASE_URL}/${relativeUrl.replace(/^(\.\.\/)+/, "")}`;
  }

  document.body.classList.add("transition-out");
  setTimeout(() => (window.location.href = fullUrl), 400);
}

// ----------------- MAIN ACTION BUTTON -----------------
mainActionBtn?.addEventListener("click", () => {
  if (!mainActionBtn.disabled) {
    actionWrapper.classList.toggle("active");
    mainActionBtn.classList.toggle(
      "menu-open",
      actionWrapper.classList.contains("active")
    );
  }
});

// ----------------- KANJI CARD NAVIGATION -----------------
if (!window.location.pathname.includes("word-details.html")) {
  const kanjiCardEl = document.querySelector(".kanji-card");
  kanjiCardEl?.addEventListener("click", () => {
    navigateWithTransition("HTML/word-details.html");
  });
}

// ----------------- BACK NAVIGATION FROM WORD-DETAILS -----------------
if (window.location.pathname.includes("word-details.html")) {
  const containerEl = document.querySelector(".container");
  containerEl?.addEventListener("click", () => {
    navigateWithTransition("index.html");
  });
}

// ----------------- VOCAB WORD CLICK -----------------
document.addEventListener("click", (e) => {
  const wordEl = e.target.closest(".vocab-word");
  if (!wordEl) return;
  const word = wordEl.textContent.trim();
  if (!word) return;
  const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(word)}`;
  window.open(url, "_blank");
});

// ----------------- SUB-ACTION CLICK HANDLING -----------------
document.querySelectorAll(".sub-action").forEach((btn) => {
  btn.addEventListener("click", () => {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  });
});

// ----------------- CLOSE MENU WHEN CLICKING OUTSIDE -----------------
document.addEventListener("click", (event) => {
  if (
    !actionWrapper?.contains(event.target) &&
    !themeModal?.contains(event.target)
  ) {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  }
});

// ----------------- THEME MODAL -----------------
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

themeModal?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeThemeModal();
});

// ----------------- LOGOUT -----------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutAction = document.getElementById("logout-action");
  if (!logoutAction) return;

  logoutAction.addEventListener("click", () => {
    localStorage.removeItem("current-user");
    sessionStorage.clear();
    showNotification("ログアウトしました。");
    setTimeout(() => {
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = `${BASE_URL}/HTML/login.html`;
      }
    }, 300);
  });
});

// ----------------- INITIAL THEME LOAD -----------------
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem(THEME_KEY) || "theme-tsukizumi";
  document.body.classList.add(savedTheme);

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === savedTheme);
  });

  // ----------------- HINT BUTTON -----------------
  let currentHintIndex = 0;
  let lastKanjiKey = "";
  const hintButton = document.querySelector(".hint-button");

  hintButton?.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const kanjiChars = [...document.querySelectorAll(".kanji-char")]
      .map((el) => (el.childNodes[0]?.nodeValue ?? el.textContent).trim())
      .join("");

    const furiganaElements = [...document.querySelectorAll(".kanji-char")]
      .map((ruby) => ruby.querySelector("rt"))
      .filter(
        (rt) =>
          rt &&
          rt.textContent &&
          /[\u4E00-\u9FFF]/.test(rt.parentElement.textContent)
      );

    if (kanjiChars !== lastKanjiKey) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
      lastKanjiKey = kanjiChars;
    }

    if (currentHintIndex >= furiganaElements.length) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
      return;
    }

    const el = furiganaElements[currentHintIndex];
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.remove("drop-in");
    void el.offsetWidth;
    el.classList.add("drop-in");
    currentHintIndex++;
  });

  // ----------------- JISHO BUTTON -----------------
  const jishoButton = document.querySelector(".jisho-button");
  jishoButton?.addEventListener("click", () => {
    const kanjiChars = [...document.querySelectorAll(".kanji-char")]
      .map((el) => el.childNodes[0].nodeValue.trim())
      .join("");
    const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(
      kanjiChars
    )}`;
    window.open(url, "_blank");
    jishoButton.blur();
  });
});

// ----------------- KANJI LAYOUT -----------------
function adjustKanjiLayout() {
  const kanjiCard = document.querySelector(".kanji-card");
  const kanjiContainer = document.querySelector(".kanji-container");
  if (!kanjiCard || !kanjiContainer) return;

  const kanjiChars = kanjiContainer.querySelectorAll(".kanji-char");
  if (kanjiChars.length === 0) return;

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