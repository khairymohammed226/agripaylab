
  // 🟢 المستخدم الحالي
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    

if (!currentUser) {
  window.location.href = "login.html";
  return;
}
let otpActive = false;

// =========================
// WITHDRAW TIMER
// =========================
let withdrawInterval;

function startWithdrawTimer(durationInSeconds) {

  let timeLeft = durationInSeconds;

  const timerElement = document.getElementById("otpTimer");

  clearInterval(withdrawInterval);

  withdrawInterval = setInterval(() => {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
      `Valid for: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {

  otpActive = false;

  clearInterval(withdrawInterval);

  generateBtn.disabled = false;

  // ❌ حذف السيشن
  sessionStorage.removeItem("atmSession");

  // ❌ اخفاء رسالة الـ OTP
  const msg = document.getElementById("atmMessage");

  msg.className = "atm-message";

  msg.textContent = "";

  // ✅ اظهار رسالة انتهاء
  timerElement.textContent = "OTP expired ❌";

  timerElement.style.color = "#e74c3c";

  timerElement.style.background =
    "rgba(231, 76, 60, 0.1)";

  // ✅ اظهار زرار الريسند
  resendBtn.classList.remove("hidden");

}

  }, 1000);
}

// =========================
// DEPOSIT TIMER
// =========================
let depositInterval;

function startDepositTimer(durationInSeconds) {

  let timeLeft = durationInSeconds;

  const depositTimer =
    document.getElementById("depositTimer");

  clearInterval(depositInterval);

  depositInterval = setInterval(() => {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    depositTimer.textContent =
      `Valid for: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {

  clearInterval(depositInterval);

  depositBtn.disabled = false;

  // ❌ حذف الـ session
  sessionStorage.removeItem("depositSession");

  // ❌ اخفاء رسالة الـ OTP
  const msg = document.getElementById("depositMessage");
  msg.className = "atm-message";
  msg.textContent = "";

  // ✅ اظهار انتهاء الوقت
  depositTimer.textContent = "OTP expired ❌";

  depositTimer.style.color = "#e74c3c";

  depositTimer.style.background =
    "rgba(231, 76, 60, 0.1)";

  // ✅ اظهار زرار الريسند
  depositResendBtn.classList.remove("hidden");

}

  }, 1000);
}
  const atmCodeInput = document.getElementById("atmCode");
  const pinInput = document.getElementById("pin");
  const amountInput = document.getElementById("amount");
const resendBtn = document.getElementById("resendOtp");
const generateBtn = document.getElementById("generateOtp");

if (resendBtn) {
  resendBtn.addEventListener("click", async () => {
otpActive = true;
generateBtn.disabled = true;
    

    try {
      const res = await fetch(`https://www.agripaylab.online/atm/generate-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        
        body: JSON.stringify({
         atmCode: atmCodeInput.value.trim(),
         pin: pinInput.value.trim(),
         amount: Number(amountInput.value),
          userId: currentUser._id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        showATMMessage(data.message, "error");
        return;
      }
const timerElement = document.getElementById("otpTimer");
     showATMMessage("Your OTP is: " + data.otp, "success");
timerElement.style.color = "#2ecc71";
timerElement.style.background = "rgba(46, 204, 113, 0.1)";
sessionStorage.setItem("atmSession", JSON.stringify({
  otp: data.otp,
  amount: Number(amountInput.value),
  atmCode: atmCodeInput.value.trim(),
  pin: pinInput.value.trim(),
  createdAt: Date.now()
}));
      // 🔁 يبدأ timer من جديد
      startWithdrawTimer(300);

    } catch {
      showATMMessage("Server error", "error");
    }
  });
}






  function maskAccountNumber(acct) {
    if (!acct) return "No Account";
    const s = String(acct);
    return "*".repeat(s.length - 4) + s.slice(-4);
  }

  const userNameDisplay = document.getElementById("userNameDisplay");
  const accountNumberDisplay = document.getElementById("accountNumberDisplay");

if (currentUser && userNameDisplay && accountNumberDisplay) {

  userNameDisplay.textContent =
    currentUser.firstName + " " + currentUser.lastName;

  (async () => {
    try {

      const res = await fetch(
        `https://www.agripaylab.online/card/${currentUser._id}`
      );

      if (res.ok) {

        const data = await res.json();

        accountNumberDisplay.textContent =
          maskAccountNumber(data.card.accountNumber);

      } else {

        accountNumberDisplay.textContent = "No Account";

      }

    } catch (err) {

      console.error(err);

      accountNumberDisplay.textContent = "No Account";

    }
  })();
}

  // 🟢 عناصر الصفحة
  const transactionType = document.getElementById("transactionType");
  const withdrawalSection = document.getElementById("withdrawalSection");



    const session = JSON.parse(sessionStorage.getItem("atmSession"));

if (session) {

  document.getElementById("amount").value = session.amount;

  // ✅ رجع البيانات المحفوظة
  document.getElementById("atmCode").value =
    session.atmCode || "";

  document.getElementById("pin").value =
    session.pin || "";


  const now = Date.now();
  const diff = now - session.createdAt;

  const remainingTime = 300 - Math.floor(diff / 1000);

  if (remainingTime > 0) {
    console.log("Returning with existing OTP");

    otpActive = true;
    generateBtn.disabled = true;

    showATMMessage("Your OTP is: " + session.otp, "success");

    startWithdrawTimer(remainingTime); // 👈 بدل 300
  } else {
   sessionStorage.removeItem("atmSession");
  }
}
  // 🟢 رسائل
function showATMMessage(text, type) {
  const msg = document.getElementById("atmMessage");
  if (!msg) return;

  msg.textContent = text;
  msg.className = "atm-message " + type + " show";

  // ❌ لو success (OTP) → يفضل ظاهر
  if (type === "success") return;

  // ✅ errors بس اللي تختفي
  setTimeout(() => {
    msg.classList.remove("show");
    msg.classList.add("hide");

    setTimeout(() => {
      msg.className = "atm-message";
    }, 600);
  }, 4000);
}
function showDepositMessage(text, type) {
  const msg = document.getElementById("depositMessage");
  if (!msg) return;

  msg.textContent = text;
  msg.className = "atm-message " + type + " show";

  if (type === "success") return;

  setTimeout(() => {
    msg.classList.remove("show");
    msg.classList.add("hide");

    setTimeout(() => {
      msg.className = "atm-message";
    }, 600);
  }, 4000);
}
  // 🟢 إظهار / إخفاء withdrawal
  if (transactionType && withdrawalSection) {
     const depositSection = document.getElementById("depositSection");
const savedPage = sessionStorage.getItem("atmPage");

if (savedPage === "withdrawal") {
  transactionType.value = "withdrawal";
  withdrawalSection.style.display = "block";
}

if (savedPage === "deposit") {
  transactionType.value = "deposit";
  depositSection.style.display = "block";
}
transactionType.addEventListener("change", () => {

  withdrawalSection.style.display = "none";
  depositSection.style.display = "none";

  if (transactionType.value === "withdrawal") {
    withdrawalSection.style.display = "block";
    sessionStorage.setItem("atmPage", "withdrawal");
  }

  if (transactionType.value === "deposit") {
    depositSection.style.display = "block";
    sessionStorage.setItem("atmPage", "deposit");
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
        const res = await fetch(`https://www.agripaylab.online/atm/generate-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            atmCode,
            pin,
            amount,
            userId: currentUser._id
          })
        });

        const data = await res.json();

        if (!res.ok) {
          showATMMessage(data.message || "Error", "error");
          return;
        }


        // 🟢 عرض OTP
showATMMessage("Your OTP is: " + data.otp, "success");
otpActive = true;              // 👈 مهم
generateBtn.disabled = true;   // 👈 مهم

sessionStorage.setItem("atmSession", JSON.stringify({
  otp: data.otp,
  amount: amount,
  atmCode: atmCode,
  pin: pin,
  createdAt: Date.now()
}));
resendBtn.classList.add("hidden");
          startWithdrawTimer(300);
         
      } catch (err) {
        console.error(err);
        showATMMessage("Server error", "error");
      }
    });
  }
// 🟢 Deposit OTP
const depositBtn = document.getElementById("generateDepositOtp");
const depositResendBtn =
  document.getElementById("depositResendOtp");
const depositAmountInput = document.getElementById("depositAmount");
const depositSession = JSON.parse(
  sessionStorage.getItem("depositSession")
);

const depositTimer = document.getElementById("depositTimer");

if (depositSession) {

  depositAmountInput.value = depositSession.amount;

  const now = Date.now();
  const diff = now - depositSession.createdAt;

  const remainingTime = 300 - Math.floor(diff / 1000);

  if (remainingTime > 0) {

    depositBtn.disabled = true;

    showDepositMessage(
      "Deposit OTP: " + depositSession.otp,
      "success"
    );


    document.getElementById(
      "goToDepositAtmBtn"
    ).style.display = "block";

    startDepositTimer(remainingTime);

  } else {

    sessionStorage.removeItem("depositSession");

  }
}

if (depositBtn) {
  depositBtn.addEventListener("click", async () => {

    const amount = Number(depositAmountInput.value);

    if (!amount || amount <= 0) {
      showDepositMessage("Enter valid amount", "error");
      return;
    }

    try {
      const res = await fetch(`https://www.agripaylab.online/atm/generate-deposit-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount,
          userId: currentUser._id
        })
      });

      const data = await res.json();

     if (data.otpActive) {

  showDepositMessage(
    "OTP already active ⏳",
    "error"
  );

  depositBtn.disabled = true;

  document.getElementById(
    "goToDepositAtmBtn"
  ).style.display = "block";

  


  return;
}

if (!res.ok) {
  showDepositMessage(data.message, "error");
  return;
}

      showDepositMessage("Deposit OTP: " + data.otp, "success");
      depositBtn.disabled = true;

startDepositTimer(300);
document.getElementById("goToDepositAtmBtn").style.display = "block";
      sessionStorage.setItem("depositSession", JSON.stringify({
        otp: data.otp,
        amount: amount,
        createdAt: Date.now()
      }));

    } catch {
      showATMMessage("Server error", "error");
    }

  });
}
if (depositResendBtn) {

  depositResendBtn.addEventListener("click", async () => {

    const amount = Number(depositAmountInput.value);

    try {

      const res = await fetch(
        `https://www.agripaylab.online/atm/generate-deposit-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount,
            userId: currentUser._id
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showDepositMessage(data.message, "error");
        return;
      }

      showDepositMessage(
        "Deposit OTP: " + data.otp,
        "success"
      );

   showDepositMessage(
  "Deposit OTP: " + data.otp,
  "success"
);

sessionStorage.setItem("depositSession", JSON.stringify({
  otp: data.otp,
  amount: amount,
  createdAt: Date.now()
}));

depositResendBtn.classList.add("hidden");

startDepositTimer(300);
    } catch {

      showDepositMessage("Server error", "error");

    }

  });

}
  // 🟢 Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

});

document.getElementById("goToAtmBtn").onclick = () => {
  window.location.href = "atm-simulator.html";
};

const goToDepositAtmBtn = document.getElementById("goToDepositAtmBtn");

if (goToDepositAtmBtn) {
  goToDepositAtmBtn.onclick = () => {
    window.location.href = "atm-deposit.html";
  };
}
// numbers only + منع الأسهم

const amountInputs = document.querySelectorAll('input[type="number"]');

amountInputs.forEach(input => {

  // يمنع كتابة أي حاجة غير أرقام
  input.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "");
  });

  // يمنع الأسهم بتاعة الزيادة والنقصان
  input.addEventListener("wheel", function (e) {
    e.preventDefault();
  });

});