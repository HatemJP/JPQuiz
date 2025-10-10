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

  // Directly navigate without loader
  window.location.href = fullUrl;
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

  // ----------------- NOTIFICATIONS MANAGEMENT -----------------
  function showNotification(message) {
    const container = document.getElementById("notification-container");
    const existing = container.querySelector(".notification");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerHTML = `<span>${message}</span>`;
    container.appendChild(notification);
    setTimeout(() => notification.remove(), 6500);
  }

  // Not-implemented buttons
  document.querySelectorAll(".sub-action.not-implemented").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      button.style.fontWeight = "bold";
      showNotification(`${name}ボタンの機能は未だ実装されていません。`);
    });
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