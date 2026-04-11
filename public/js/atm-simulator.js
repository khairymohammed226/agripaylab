const withdrawBtn = document.getElementById("withdrawBtn");
const messageBox = document.getElementById("atmMessage");
if (!pin || !otpInput || !amountInput) {
  showMessage("All fields are required ❌", "error");
  return;
}
if (!user) {
  showMessage("Please login again ❌", "error");
  return;
}
const session = JSON.parse(localStorage.getItem("atmSession"));

if (session) {
  document.getElementById("amount").value = session.amount;

  document.getElementById("maxAmount").textContent =
    "Max allowed: " + session.amount + " EGP";
}
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "atm-message show " + type;
}

withdrawBtn.onclick = async () => {

  const pin = document.getElementById("pin").value.trim();
  const otpInput = document.getElementById("otp").value.trim();
  const amountInput = Number(document.getElementById("amount").value);

  const user = JSON.parse(localStorage.getItem("currentUser"));

  // ❌ مفيش session
  if (!session) {
    showMessage("No active session ❌", "error");
    return;
  }

  // ⏳ تحقق من الوقت (5 دقايق)
  const now = Date.now();
  const diff = now - session.createdAt;

  if (diff > 5 * 60 * 1000) {
    showMessage("OTP expired ⏳", "error");
    localStorage.removeItem("atmSession");
    return;
  }

  // ❌ المبلغ أكبر
  if (amountInput > session.amount) {
    showMessage("Amount exceeds allowed limit 💸", "error");
    return;
  }

  try {
     withdrawBtn.disabled = true; // 👈 هنا

    showMessage("Processing...", "success");

    // 🔥 نكلم السيرفر
    const res = await fetch("/atm/withdraw", {
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
    showMessage("Take your cash 💵", "success");

    // 🧹 امسح session
    localStorage.removeItem("atmSession");

    // 🔄 ممكن تحدث الرصيد
    localStorage.setItem("currentUser", JSON.stringify({
      ...user,
      balance: data.newBalance
    }));

  } catch (err) {
      withdrawBtn.disabled = false; 
    console.error(err);
    showMessage("Server error ❌", "error");
  }
};