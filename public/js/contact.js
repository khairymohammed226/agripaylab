function showMessage(text, type) {
  const msg = document.getElementById("successMessage");

  msg.textContent = text;
  msg.className = "form-message " + type;
  showMessage("Message sent successfully ✅", "success");

  setTimeout(() => {
    msg.style.display = "none";
  }, 3000);
}
document.querySelector("form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  const res = await fetch(`https://agripay.online/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, phone, email, message })
  });

  const data = await res.json();

if (!res.ok) {
  showMessage(data.message || "Something went wrong ❌", "error");
  return;
}
const msg = document.getElementById("successMessage");

msg.style.display = "block";

// إخفاء بعد 3 ثواني
setTimeout(() => {
  msg.style.display = "none";
}, 3000);

// تفريغ الفورم
document.querySelector("form").reset();

});