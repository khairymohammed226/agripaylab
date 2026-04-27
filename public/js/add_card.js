
document.getElementById("cardForm").addEventListener("submit", async function(e) {
  e.preventDefault();
     const messageDiv = document.getElementById("cardMessage");
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
const userId = user?._id;

console.log("Using userId:", userId);

if (!userId) {
  messageDiv.style.display = "block";
messageDiv.textContent = "Session expired, please login again";
messageDiv.className = "message error";

setTimeout(() => {
  window.location.href = "login.html";

}, 1500);
  return;
}



 

  const cardName = document.getElementById("cardName").value;
  const accountNumber = document.getElementById("accountNumber").value;
  const cardType = document.getElementById("cardType").value;
  const expiryDate = document.getElementById("expiry").value;
  const cvv = document.getElementById("cvv").value;
  const cardPassword = document.getElementById("cardPassword").value;

  
 

// تحقق MM/YY
if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
  messageDiv.style.display = "block";
  messageDiv.textContent = "❌ ادخل تاريخ صحيح بصيغة MM/YY";
  messageDiv.className = "message error";
  return;
}
  try {
if (!cardName || !accountNumber || !cvv || !cardPassword) {
  messageDiv.style.display = "block";
  messageDiv.textContent = "❌ Please fill all fields";
  messageDiv.className = "message error";
  return;
}
if (cvv.length !== 3) {
  messageDiv.textContent = "❌ CVV must be 3 digits";
  messageDiv.className = "message error";
  return;
}
    const response = await fetch("https://agripay.site/add-card",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        cardName,
        accountNumber,
        cardType,
        expiryDate,
        cvv,
        cardPassword
      })
    });

    const data = await response.json();

    messageDiv.style.display = "block";
    messageDiv.textContent = data.message;

    if (response.ok) {
      messageDiv.className = "message success";

      // بعد ثانيتين يروح للدashboard
      setTimeout(() => {
      
window.location.href = "dashboard.html";
      }, 3000);

    } else {
      messageDiv.className = "message error";
    }

  } catch (err) {
    console.error(err);

    messageDiv.style.display = "block";
    messageDiv.textContent = "Server error";
    messageDiv.className = "message error";
  }

});
const expiryInput = document.getElementById("expiry");

if (expiryInput) {
  expiryInput.addEventListener("input", function () {

    // يشيل أي حاجة مش رقم
    let value = this.value.replace(/\D/g, "");

    // يحط / بعد أول رقمين
    if (value.length >= 3) {
      value = value.slice(0,2) + "/" + value.slice(2,4);
    }

    this.value = value;
  });
}

