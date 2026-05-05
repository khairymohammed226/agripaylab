document.addEventListener("DOMContentLoaded", () => {

  const withdrawBtn = document.getElementById("withdrawBtn");
  const messageBox = document.getElementById("atmMessage");
  const backBtn = document.getElementById("backBtn");

  const session = JSON.parse(sessionStorage.getItem("atmSession"));

  if (session) {
    document.getElementById("amount").value = session.amount;
  }

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "atm-message show " + type;
  }

  withdrawBtn.onclick = async () => {

    const pin = document.getElementById("pin").value.trim();
    const otpInput = document.getElementById("otp").value.trim();
    const amountInput = Number(document.getElementById("amount").value);

    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    if (!pin || !otpInput || !amountInput) {
      showMessage("All fields are required ❌", "error");
      return;
    }

if (!user) {
  showMessage("Session expired ❌", "error");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);

  return;
}

 if (!session) {
  showMessage("No active session ❌", "error");

  setTimeout(() => {
    window.location.href = "atm.html";
  }, 1500);

  return;
}

    const now = Date.now();
    const diff = now - session.createdAt;

    if (diff > 5 * 60 * 1000) {
      showMessage("OTP expired ⏳", "error");
      sessionStorage.removeItem("atmSession");
      return;
    }

    if (amountInput > session.amount) {
      showMessage("Amount exceeds allowed limit 💸", "error");
      return;
    }

    try {
      withdrawBtn.disabled = true;

      showMessage("Processing...", "success");

      const res = await fetch(`https://www.agripaylab.online/atm/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user._id,
          otp: otpInput,
          atmCode: session.atmCode,
          pin,
          amount: amountInput
        })
      });

      const data = await res.json();

      withdrawBtn.disabled = false;

      if (!res.ok) {
        showMessage(data.message || "Error ❌", "error");
        return;
      }

      // ✅ نجاح
      showMessage("Withdrawal successful 💸", "success");

      sessionStorage.removeItem("atmSession");

      sessionStorage.setItem("currentUser", JSON.stringify({
        ...user,
        balance: data.newBalance
      }));

      // 🔥 الجديد (مهم)
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);

    } catch (err) {
      withdrawBtn.disabled = false;
      console.error(err);
      showMessage("Server error ❌", "error");
    }
  };

  backBtn.onclick = () => {
    window.location.href = "atm.html";
  };

});