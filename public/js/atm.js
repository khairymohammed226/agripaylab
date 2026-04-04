document.addEventListener("DOMContentLoaded", () => {

  // 🟢 المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  function maskAccountNumber(acct) {
    if (!acct) return "No Account";
    const s = String(acct);
    return "*".repeat(s.length - 4) + s.slice(-4);
  }

  const userNameDisplay = document.getElementById("userNameDisplay");
  const accountNumberDisplay = document.getElementById("accountNumberDisplay");

  if (currentUser && userNameDisplay && accountNumberDisplay) {
    userNameDisplay.textContent = currentUser.fullname;
    accountNumberDisplay.textContent = maskAccountNumber(currentUser.accountNumber);
  }

  // 🟢 عناصر الصفحة
  const transactionType = document.getElementById("transactionType");
  const withdrawalSection = document.getElementById("withdrawalSection");

  const atmCodeInput = document.getElementById("atmCode");
  const pinInput = document.getElementById("pin");
  const amountInput = document.getElementById("amount");

  const generateBtn = document.getElementById("generateOtp");

  // 🟢 رسائل
  function showATMMessage(text, type) {
    const msg = document.getElementById("atmMessage");
    if (!msg) return;

    msg.textContent = text;
    msg.className = "atm-message " + type + " show";

    setTimeout(() => {
      msg.classList.remove("show");
      msg.classList.add("hide");

      setTimeout(() => {
        msg.className = "atm-message";
      }, 600);
    }, 6000);
  }

  // 🟢 إظهار / إخفاء withdrawal
  if (transactionType && withdrawalSection) {
    transactionType.addEventListener("change", () => {
      if (transactionType.value === "withdrawal") {
        withdrawalSection.style.display = "block";
      } else {
        withdrawalSection.style.display = "none";
      }
    });
  }

  // 🟢 Generate OTP
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {

      const atmCode = atmCodeInput.value.trim();
      const pin = pinInput.value.trim();
      const amount = amountInput.value.trim();

      // 🔴 Validation
      if (!atmCode || !pin || !amount) {
        showATMMessage("Please fill all fields", "error");
        return;
      }

      if (amount <= 0) {
        showATMMessage("Invalid amount", "error");
        return;
      }

      try {
        const res = await fetch("/atm/generate-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            atmCode,
            pin,
            amount
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showATMMessage(data.message || "Error", "error");
          return;
        }

        // 🟢 عرض OTP
        showATMMessage(`Your OTP: ${data.otp}`, "success");

      } catch {
        showATMMessage("Server error", "error");
      }
    });
  }

  // 🟢 Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

});

document.addEventListener("DOMContentLoaded", () => {

  // 🟢 المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  function maskAccountNumber(acct) {
    if (!acct) return "No Account";
    const s = String(acct);
    return "*".repeat(s.length - 4) + s.slice(-4);
  }

  const userNameDisplay = document.getElementById("userNameDisplay");
  const accountNumberDisplay = document.getElementById("accountNumberDisplay");

  if (currentUser && userNameDisplay && accountNumberDisplay) {
    userNameDisplay.textContent = currentUser.fullname;
    accountNumberDisplay.textContent = maskAccountNumber(currentUser.accountNumber);
  }

  // 🟢 عناصر الصفحة
  const transactionType = document.getElementById("transactionType");
  const withdrawalSection = document.getElementById("withdrawalSection");

  const atmCodeInput = document.getElementById("atmCode");
  const pinInput = document.getElementById("pin");
  const amountInput = document.getElementById("amount");

  const generateBtn = document.getElementById("generateOtp");

  // 🟢 رسائل
  function showATMMessage(text, type) {
    const msg = document.getElementById("atmMessage");
    if (!msg) return;

    msg.textContent = text;
    msg.className = "atm-message " + type + " show";

    setTimeout(() => {
      msg.classList.remove("show");
      msg.classList.add("hide");

      setTimeout(() => {
        msg.className = "atm-message";
      }, 600);
    }, 6000);
  }

  // 🟢 إظهار / إخفاء withdrawal
  if (transactionType && withdrawalSection) {
    transactionType.addEventListener("change", () => {
      if (transactionType.value === "withdrawal") {
        withdrawalSection.style.display = "block";
      } else {
        withdrawalSection.style.display = "none";
      }
    });
  }

  // 🟢 Generate OTP
  if (generateBtn) {
    generateBtn.addEventListener("click", async () => {

      const atmCode = atmCodeInput.value.trim();
      const pin = pinInput.value.trim();
      const amount = amountInput.value.trim();

      // 🔴 Validation
      if (!atmCode || !pin || !amount) {
        showATMMessage("Please fill all fields", "error");
        return;
      }

      if (amount <= 0) {
        showATMMessage("Invalid amount", "error");
        return;
      }

      try {
        const res = await fetch("/atm/generate-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            atmCode,
            pin,
            amount
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showATMMessage(data.message || "Error", "error");
          return;
        }

        // 🟢 عرض OTP
        showATMMessage(`Your OTP: ${data.otp}`, "success");

      } catch {
        showATMMessage("Server error", "error");
      }
    });
  }

  // 🟢 Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

});

