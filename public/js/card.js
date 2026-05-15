document.addEventListener("DOMContentLoaded", async () => {

  // =========================
  // 🔒 CHECK SESSION
  // =========================
  const stored = sessionStorage.getItem("currentUser");

  if (!stored) {
    window.location.href = "login.html";
    return;
  }

  let user;
  try {
    user = JSON.parse(stored);
  } catch {
    sessionStorage.clear();
    window.location.href = "login.html";
    return;
  }

  if (!user._id) {
    window.location.href = "login.html";
    return;
  }

  // =========================
  // 🧾 ELEMENTS
  // =========================
  const addCardBox = document.getElementById("addCardBox");

  const liveName   = document.getElementById("liveName");
  const liveNumber = document.getElementById("liveNumber");
  const liveExp    = document.getElementById("liveExp");

  const cardNameEl = document.getElementById("cardName");
  const cardNumberEl = document.getElementById("cardNumber");
  const expDateEl    = document.getElementById("cardExpiry");
  const cardTypeEl   = document.getElementById("cardType");

  const toggleBtn = document.getElementById("toggleCard");

  // =========================
  // 🧠 FULL NAME
  // =========================
  const fullName = (user.firstName && user.lastName)
  ? `${user.firstName} ${user.lastName}`.toUpperCase()
  : "USER";;
  liveName.textContent = fullName;
cardNameEl.textContent = fullName;

  // =========================
  // 📢 MESSAGE
  // =========================
  function showCardMessage(text, type) {
    const msg = document.getElementById("cardMessage");
    if (!msg) return;

    msg.textContent = text;
    msg.className = "form-message " + type;
    msg.style.display = "block";

    setTimeout(() => {
      msg.style.display = "none";
    }, 5000);
  }

  // =========================
  // 💳 GET CARD
  // =========================
  try {
    const res = await fetch(`https://www.agripaylab.online/card/${user._id}`);

    if (!res.ok) throw new Error("Card fetch failed");

    const data = await res.json();

    // ❌ مفيش كارت
    if (!data.card) {

  liveName.textContent = "No Card";
  liveNumber.textContent = "**** **** **** ****";
  liveExp.textContent = "--/--";

  cardNameEl.textContent = "-";
  cardNumberEl.textContent = "-";
  expDateEl.textContent = "-";
  cardTypeEl.textContent = "-";

  document.querySelector(".payment-form").style.display = "none";
  addCardBox.style.display = "block";
// لو فيه كارد

  return;
}
document.querySelector(".payment-form").style.display = "block";
addCardBox.style.display = "none";

    // =========================
    // ✅ CARD EXISTS
    // =========================
    const card = data.card;
     
    const fullCardNumber = String(card.accountNumber);
    const last4 = fullCardNumber.slice(-4);

    let isVisible = false;

    // display masked
    const masked = "**** **** **** " + last4;

    liveNumber.textContent = masked;
    cardNumberEl.textContent = masked;

    // toggle
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {

        if (!isVisible) {
          liveNumber.textContent = fullCardNumber;
          cardNumberEl.textContent = fullCardNumber;
          toggleBtn.textContent = "hide number";
          isVisible = true;
        } else {
          liveNumber.textContent = masked;
          cardNumberEl.textContent = masked;
          toggleBtn.textContent = "show num";
          isVisible = false;
        }

      });
    }

    // expiry
    liveExp.textContent = card.expiryDate;
    expDateEl.textContent = card.expiryDate;

    // type
    cardTypeEl.textContent = card.cardType;

  } catch (err) {
    console.error(err);
    showCardMessage("Failed to load card data", "error");
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }

});