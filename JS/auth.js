// -------------------- IndexedDB Setup --------------------
const DB_NAME = "KanjiAdventureDB";
const DB_VERSION = 1;
let db;

// Open IndexedDB
const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains("users")) {
        const store = db.createObjectStore("users", { keyPath: "username" });
        store.createIndex("email", "email", { unique: true });
        console.log("Users store created.");
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("Database opened successfully:", db);
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };
  });

// -------------------- Register User --------------------
const registerUser = async (username, email, password, nickname) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    const user = { username, email, password, nickname };
    console.log("Attempting to register user:", user);

    const addReq = store.add(user);
    addReq.onsuccess = () => {
      console.log("User registered successfully:", user);

      // Save nickname in localStorage
      localStorage.setItem(`nickname_${username}`, nickname);

      resolve(true);
    };
    addReq.onerror = (e) => {
      console.error("Registration error:", e.target.error);
      reject(e.target.error);
    };
  });
};

// -------------------- Login User --------------------
const loginUser = async (usernameOrEmail, password) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    const finishLogin = (userObj) => {
      console.log("Login successful:", userObj);
      localStorage.setItem("current-user", userObj.username);

      // Store nickname in localStorage
      if (userObj.nickname) {
        localStorage.setItem(`nickname_${userObj.username}`, userObj.nickname);
      }

      if (!localStorage.getItem(`firstLogin_${userObj.username}`)) {
        localStorage.setItem(`progress_${userObj.username}`, 0);
        localStorage.setItem(`firstLogin_${userObj.username}`, "done");
      }

      resolve({ success: true, username: userObj.username });
    };

    // Try username first
    const getReq = store.get(usernameOrEmail);
    getReq.onsuccess = (e) => {
      const user = e.target.result;
      if (user && user.password === password) {
        finishLogin(user);
      } else {
        // Try email
        const index = store.index("email");
        index.get(usernameOrEmail).onsuccess = (ev) => {
          const userByEmail = ev.target.result;
          if (userByEmail && userByEmail.password === password) {
            finishLogin(userByEmail);
          } else {
            console.log("Login failed: invalid credentials");
            resolve({ success: false });
          }
        };
        index.get(usernameOrEmail).onerror = (err) => {
          console.error("Email index error:", err);
          resolve({ success: false });
        };
      }
    };
    getReq.onerror = (err) => {
      console.error("Username get error:", err);
      reject(err);
    };
  });
};

// -------------------- Delete User --------------------
const deleteUser = async (username) => {
  await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    const deleteReq = store.delete(username);

    deleteReq.onsuccess = () => {
      console.log(`Delete request successful for ${username}`);
    };

    deleteReq.onerror = (err) => {
      console.error(`Delete request failed for ${username}:`, err);
      reject(err);
    };

    tx.oncomplete = () => {
      console.log(`Transaction complete: ${username} deleted.`);

      // Remove all localStorage data for this user
      const keysToRemove = [
        "current-user",
        `username_${username}`,
        `nickname_${username}`,
        `gender_${username}`,
        `progress_${username}`,
        `firstLogin_${username}`,
        `correct_${username}`,
        `wrong_${username}`,
        `total_${username}`,
      ];

      ["male", "female"].forEach((gender) => {
        keysToRemove.push(`avatar_${gender}_${username}`);
      });

      Object.keys(localStorage).forEach((key) => {
        if (key.includes(`_${username}`) && !keysToRemove.includes(key)) {
          keysToRemove.push(key);
        }
      });

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      console.log(`All localStorage data for ${username} deleted.`);

      resolve(true);
    };

    tx.onerror = (err) => {
      console.error("Transaction error:", err);
      reject(err);
    };
  });
};

// -------------------- Utility: Check if User is Logged In --------------------
const checkCurrentUser = () => {
  const currentUser = localStorage.getItem("current-user");
  if (!currentUser || currentUser === "null" || currentUser === "undefined") {
    if (typeof navigateWithTransition === "function") {
      navigateWithTransition("HTML/login.html");
    } else {
      window.location.href = "HTML/login.html";
    }
    return null;
  }
  return currentUser;
};

// -------------------- Forms Handling --------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");

  // Login form submit
  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usernameOrEmail = loginForm[0].value.trim();
    const password = loginForm[1].value;

    try {
      const result = await loginUser(usernameOrEmail, password);
      if (result.success) {
        alert(
          `ようこそ、${
            localStorage.getItem(`nickname_${result.username}`) ||
            result.username
          }さん！ログイン成功しました。`
        );
        loginForm.reset();
        window.location.href = "../index.html";
      } else {
        alert("ユーザー名/メールまたはパスワードが間違っています。");
      }
    } catch (err) {
      console.error(err);
      alert("ログイン中にエラーが発生しました。");
    }
  });

  // Register form submit
  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = registerForm[0].value.trim();
    const email = registerForm[1].value.trim();
    const password = registerForm[2].value;
    const confirmPassword = registerForm[3].value;
    const nickname = registerForm[4]?.value.trim() || username; // Optional nickname field, fallback to username

    if (password !== confirmPassword) {
      alert("パスワードが一致しません。");
      return;
    }

    try {
      await registerUser(username, email, password, nickname);
      alert("登録成功！ログインして冒険を始めよう！");
      registerForm.reset();
      document.getElementById("authBox")?.classList.remove("register-mode");

      // Auto-login after registration
      const result = await loginUser(username, password);
      if (result.success) {
        window.location.href = "../index.html";
      }
    } catch (err) {
      if (err.name === "ConstraintError") {
        alert("このユーザー名またはメールアドレスは既に使われています。");
      } else {
        alert("登録に失敗しました: " + err);
      }
    }
  });
});