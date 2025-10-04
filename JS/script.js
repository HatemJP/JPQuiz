// ----------------- USER SESSION -----------------
if (!currentUser) {
  window.location.href = "../HTML/login.html";
}

// ----------------- CONSTANTS -----------------
const THEME_KEY = "kanjiQuestTheme";
let currentAnimationState = 0;

// ----------------- ELEMENTS -----------------
const mainActionBtn = document.getElementById("main-action-btn");
const actionWrapper = mainActionBtn?.closest(".action-btn-wrapper");
const themeModal = document.querySelector(".theme-modal");
const toggleBtn = document.getElementById("toggle-animation-btn");
const wandBtn = document.getElementById("wand-action");

// ----------------- NAVIGATION -----------------
function navigateWithTransition(url) {
  document.body.classList.add("transition-out");
  setTimeout(() => (window.location.href = url), 400);
}

function navigateTo(url) {
  if (url === "index.html") window.location.href = "../index.html";
  else window.location.href = `HTML/${url}`;
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

if (!window.location.pathname.includes("word-details")) {
  const kanjiCardEl = document.querySelector(".kanji-card");
  kanjiCardEl?.addEventListener("click", () => {
    navigateWithTransition("HTML/word-details.html");
  });
}

// ----------------- CLOSE MENU WHEN CLICK OUTSIDE -----------------
document.addEventListener("click", (event) => {
  if (
    !actionWrapper?.contains(event.target) &&
    !themeModal?.contains(event.target)
  ) {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  }
});

document.querySelectorAll(".sub-action").forEach((btn) => {
  btn.addEventListener("click", () => {
    actionWrapper?.classList.remove("active");
    mainActionBtn?.classList.remove("menu-open");
  });
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

// ----------------- ANIMATION HANDLING -----------------
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

// ----------------- LOGOUT -----------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutAction = document.getElementById("logout-action");
  if (logoutAction) {
    logoutAction.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      sessionStorage.clear();
      showNotification("ログアウトしました。");
      navigateWithTransition("../HTML/login.html");
    });
  }
});

// ----------------- INITIAL THEME LOAD -----------------
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme =
    localStorage.getItem("kanjiQuestTheme") || "theme-tsukizumi";
  document.body.classList.add(savedTheme);
});

window.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme && !body.classList.contains(savedTheme)) {
    body.classList.add(savedTheme);
  }

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.theme === savedTheme);
  });

  // ----------------- HINT BUTTON -----------------
  let currentHintIndex = 0;
  const hintButton = document.querySelector(".hint-button");

  hintButton?.addEventListener("click", () => {
    const furiganaElements = [...document.querySelectorAll(".kanji-char")]
      .filter((ruby) => ruby.querySelector("rt")?.textContent)
      .map((ruby) => ruby.querySelector("rt"))
      .filter((rt) => /[\u4E00-\u9FFF]/.test(rt.parentElement.textContent));

    if (currentHintIndex >= furiganaElements.length) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
    } else {
      const el = furiganaElements[currentHintIndex];
      el.classList.remove("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add("drop-in");
        });
      });
      currentHintIndex++;
    }

    const inputField = document.querySelector("input");
    if (inputField && document.activeElement !== inputField) inputField.focus();
  });

  // ----------------- JISHO BUTTON -----------------
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

  const inputField = document.querySelector("input");
  inputField?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkAnswer();
  });

  themeModal?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeThemeModal();
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