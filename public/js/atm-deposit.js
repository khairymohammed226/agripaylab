document.addEventListener("DOMContentLoaded", () => {

  const verifyBtn = document.getElementById("verifyBtn");
  const insertBtn = document.getElementById("insertBtn");
  const messageBox = document.getElementById("atmMessage");

  const otpInput = document.getElementById("otp");

  const depositInfo = document.getElementById("depositInfo");
  const userNameEl = document.getElementById("userName");
  const accountNumberEl = document.getElementById("accountNumber");
  const amountBox = document.getElementById("amountBox");

  const backBtn = document.getElementById("backBtn");

  let currentOtp = null;

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "atm-message show " + type;
  }

  // 🔐 VERIFY OTP
  verifyBtn.onclick = async () => {

    const otp = otpInput.value.trim();

    if (!otp) {
      showMessage("Enter OTP ❌", "error");
      return;
    }

    try {
      verifyBtn.disabled = true;
      showMessage("Verifying...", "success");

      const res = await fetch("https://agripay.site/atm/verify-deposit-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp })
      });

      const data = await res.json();
      verifyBtn.disabled = false;

      if (!res.ok) {
        showMessage(data.message || "Invalid OTP ❌", "error");
        return;
      }

      // ✅ عرض البيانات
      depositInfo.style.display = "block";

      userNameEl.textContent = data.name;

      const last4 = data.accountNumber.slice(-4);
      accountNumberEl.textContent = "**** **** **** " + last4;

      amountBox.textContent = data.amount + " EGP";

      currentOtp = otp;

      showMessage("OTP Verified ✅", "success");

    } catch {
      verifyBtn.disabled = false;
      showMessage("Server error ❌", "error");
    }

  };

  // 💵 INSERT CASH
  insertBtn.onclick = async () => {

    if (!currentOtp) return;

    try {
      insertBtn.disabled = true;
      showMessage("Processing deposit...", "success");

      const res = await fetch("https://agripay.site/atm/complete-deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp: currentOtp })
      });

      const data = await res.json();

      insertBtn.disabled = false;

      if (!res.ok) {
        showMessage(data.message || "Error ❌", "error");
        return;
      }

      showMessage("Deposit Successful 💰", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);

    } catch {
      insertBtn.disabled = false;
      showMessage("Server error ❌", "error");
    }

  };

  // 🔙 Back
  backBtn.onclick = () => {
    window.location.href = "atm.html";
  };

});