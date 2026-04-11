
  // 🟢 المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
document.addEventListener("DOMContentLoaded", () => {
if (!currentUser) {
  alert("Please login first");
  window.location.href = "login.html";
  return;
}
let otpActive = false;
  let timerInterval;
function startOtpTimer(durationInSeconds) {
  let timeLeft = durationInSeconds;

  const timerElement = document.getElementById("otpTimer");

  clearInterval(timerInterval);
  

  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `Valid for: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    timeLeft--;

    if (timeLeft < 0) {
      otpActive = false;
generateBtn.disabled = false;
      clearInterval(timerInterval);
      timerElement.textContent = "OTP expired ❌";
        resendBtn.classList.remove("hidden"); // 👈 هنا

timerElement.style.color = "#e74c3c"; // أحمر
timerElement.style.background = "rgba(231, 76, 60, 0.1)";


    }
  }, 1000);
}
  const atmCodeInput = document.getElementById("atmCode");
  const pinInput = document.getElementById("pin");
  const amountInput = document.getElementById("amount");
const resendBtn = document.getElementById("resendOtp");

if (resendBtn) {
  resendBtn.addEventListener("click", async () => {
otpActive = true;
generateBtn.disabled = true;
    

    try {
      const res = await fetch("/atm/generate-otp", {
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

     showATMMessage("Your OTP is: " + data.otp, "success");
timerElement.style.color = "#2ecc71";
timerElement.style.background = "rgba(46, 204, 113, 0.1)";
      // 🔁 يبدأ timer من جديد
      startOtpTimer(300);

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
    userNameDisplay.textContent = currentUser.fullname;
    accountNumberDisplay.textContent = maskAccountNumber(currentUser.accountNumber);
  }

  // 🟢 عناصر الصفحة
  const transactionType = document.getElementById("transactionType");
  const withdrawalSection = document.getElementById("withdrawalSection");



  const generateBtn = document.getElementById("generateOtp");

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

localStorage.setItem("atmSession", JSON.stringify({
  otp: data.otp,
  amount: amount,
  atmCode: atmCode,
  createdAt: Date.now()
}));
resendBtn.classList.add("hidden");
          startOtpTimer(300);
         
      } catch (err) {
        console.error(err);
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

document.getElementById("goToAtmBtn").onclick = () => {
  window.location.href = "atm-simulator.html";
};
