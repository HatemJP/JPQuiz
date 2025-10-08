const currentUser = localStorage.getItem("current-user");

// Only redirect if no user and we're not already on login.html
if (!currentUser && !window.location.pathname.includes("login.html")) {
  window.location.href = "./HTML/login.html";
}

// Optional: Prevent login page from redirecting if already logged in
if (currentUser && window.location.pathname.includes("login.html")) {
  window.location.href = "../index.html";
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
  if (!logoutAction) return;

  logoutAction.addEventListener("click", () => {
    // Clear user data
    localStorage.removeItem("current-user");
    sessionStorage.clear();

    // Optional: show a small notification
    showNotification("ログアウトしました。");

    // Redirect to login page safely
    setTimeout(() => {
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = "./HTML/login.html";
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
  // inside DOMContentLoaded (replace your existing hint handler)
  let currentHintIndex = 0;
  let lastKanjiKey = "";

  const hintButton = document.querySelector(".hint-button");

  hintButton?.addEventListener("mousedown", (e) => {
    e.preventDefault();

    // Build a simple key representing the currently shown kanji sequence
    const kanjiChars = [...document.querySelectorAll(".kanji-char")]
      .map((el) => {
        // prefer the raw text node if present, otherwise fallback to textContent
        return el.childNodes[0] && el.childNodes[0].nodeValue
          ? el.childNodes[0].nodeValue.trim()
          : el.textContent.trim();
      })
      .join("");

    // Collect rt elements that actually have furigana text and are above kanji
    const furiganaElements = [...document.querySelectorAll(".kanji-char")]
      .map((ruby) => ruby.querySelector("rt"))
      .filter(
        (rt) =>
          rt &&
          rt.textContent &&
          /[\u4E00-\u9FFF]/.test(rt.parentElement.textContent)
      );

    // If the shown kanji changed since last time, reset hint state so we start from the first furigana
    if (kanjiChars !== lastKanjiKey) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
      lastKanjiKey = kanjiChars;
    }

    // Cycle behavior (same as before) — if we've exhausted hints, hide and reset
    if (currentHintIndex >= furiganaElements.length) {
      furiganaElements.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("drop-in");
      });
      currentHintIndex = 0;
      return;
    }

    // Reveal the next furigana immediately (force reflow so animation runs on first click)
    const el = furiganaElements[currentHintIndex];
    if (!el) return;
    el.classList.remove("hidden");
    el.classList.remove("drop-in"); // reset (safe)
    void el.offsetWidth; // force reflow so animation will start
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

  // ----------------- VOCAB WORD CLICK (only on word-details.html) -----------------
  if (window.location.pathname.includes("word-details.html")) {
    const vocabContainer = document.querySelector(".vocab-words");
    if (vocabContainer) {
      vocabContainer.addEventListener("click", (event) => {
        const wordEl = event.target.closest(".vocab-word");
        if (!wordEl) return;

        const wordText = wordEl.textContent.trim();
        if (wordText) {
          const url = `https://jisho.hlorenzi.com/search/${encodeURIComponent(
            wordText
          )}`;
          window.open(url, "_blank");
        }
      });
    }
  }

  // ----------------- THEME MODAL CLOSE -----------------
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