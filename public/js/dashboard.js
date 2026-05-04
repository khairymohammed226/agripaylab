let currentAccountNumber = "";

document.addEventListener("DOMContentLoaded", async () => {

  // =========================
  // 🔒 CHECK SESSION
  // =========================
  const stored = sessionStorage.getItem("currentUser");

  if (!stored) {
    alert("Session expired, login again");
    window.location.href = "login.html";
    return;
  }

  let userData;
  try {
    userData = JSON.parse(stored);
  } catch {
    sessionStorage.clear();
    window.location.href = "login.html";
    return;
  }

  if (!userData?._id) {
  alert("Invalid session, please login again");
  window.location.href = "login.html";
  return;
}

  // =========================
  // 👤 GET USER DATA
  // =========================
  try {
    const res = await fetch(`https://bankingnew.onrender.com/user/${userData._id}`)

    if (!res.ok) {
      throw new Error("User fetch failed");
    }

    const user = await res.json();

    sessionStorage.setItem("currentUser", JSON.stringify({
  ...userData,
  ...user
}));

    document.getElementById("fullname").textContent =
      `${user.firstName} ${user.lastName}`;

    document.getElementById("balance").textContent =
      user.balance;

  } catch (err) {
    console.error(err);
    alert("Error loading user data");
    return;
  }

  // =========================
  // 💳 GET CARD
  // =========================
  try {
    const cardRes = await fetch(`https://bankingnew.onrender.com/card/${userData._id}`)

    if (cardRes.ok) {
      const cardData = await cardRes.json();

      currentAccountNumber = cardData.card.accountNumber;

      const acct = String(currentAccountNumber);
      const masked =
        acct.length <= 4
          ? acct
          : "*".repeat(acct.length - 4) + acct.slice(-4);

      document.getElementById("accountNumber").textContent = masked;

    } else {
      document.getElementById("accountNumber").textContent = "No Account";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("accountNumber").textContent = "No Account";
  }

  // =========================
  // 💸 GET TRANSACTIONS
  // =========================
  try {
    const res = await fetch(`https://bankingnew.onrender.com/transactions/${userData._id}`)

    if (!res.ok) throw new Error("Transactions failed");

    const transactions = await res.json();

    const list = document.getElementById("transactionsList");

    if (transactions.length === 0) {
      list.innerHTML = "<p>No transactions yet</p>";
    }

    transactions.forEach(t => {

      let title = "";
      let details = "";
      let amountSign = "";

      if (t.source === "ATM") {

  if (t.type === "withdrawal") {
    title = "ATM Withdrawal 💸";
    details = `ATM Code: ${t.atmCode || "N/A"}`;
    amountSign = "-";
  }

  else if (t.type === "deposit") {
    title = "ATM Deposit 💰";
    details = `Cash Deposit`;
    amountSign = "+";
  }

}
      else if (t.direction === "out") {
        title = "Transfer Sent";
        details = `
          To: ${t.beneficiaryName}<br>
          Bank: ${t.source}
        `;
        amountSign = "-";
      }

      else if (t.direction === "in") {
        title = "Transfer Received";
        details = `
          From: ${t.senderName}<br>
          Bank: ${t.source}
        `;
        amountSign = "+";
      }

      else {
        title = "Bank Transaction";
        details = "";
      }

      const box = document.createElement("div");
      box.className = "transaction-box";

      box.innerHTML = `
        <b>${title}</b><br>
        ${details}
        <br><br>
        <span class="amount">${amountSign}${t.amount} EGP</span>
        <span class="status">successful</span>
        <br>
        <small>
          ${new Date(t.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </small>
      `;

      list.appendChild(box);

      // =========================
      // 🧾 MODAL CLICK
      // =========================
      box.addEventListener("click", () => {

  const overlay = document.getElementById("transactionOverlay");

  document.getElementById("modalAmount").textContent =
    t.amount + " EGP";

  // 🔥 ATM logic
  if (t.source === "ATM") {

    if (t.type === "withdrawal") {

      document.getElementById("modalFromName").textContent = "Your Account";
      document.getElementById("modalFromNumber").textContent = currentAccountNumber;

      document.getElementById("modalToName").textContent = "ATM Machine";
      document.getElementById("modalToNumber").textContent = t.atmCode || "ATM";

      document.getElementById("modalBank").textContent = "ATM Withdrawal";

    }

    else if (t.type === "deposit") {

      document.getElementById("modalFromName").textContent = "ATM Machine";
      document.getElementById("modalFromNumber").textContent = "Cash";

      document.getElementById("modalToName").textContent = "Your Account";
      document.getElementById("modalToNumber").textContent = currentAccountNumber;

      document.getElementById("modalBank").textContent = "ATM Deposit";

    }

  }

  // 🔵 تحويل عادي
  else {

    document.getElementById("modalFromName").textContent =
      t.senderName || "You";

    document.getElementById("modalFromNumber").textContent =
      currentAccountNumber;

    document.getElementById("modalToName").textContent =
      t.source === "Wallet"
        ? "Wallet"
        : t.beneficiaryName || "Receiver";

    document.getElementById("modalToNumber").textContent =
      t.beneficiaryAccount || "----";

    document.getElementById("modalBank").textContent =
      t.source;
  }

  document.getElementById("modalDate").textContent =
    new Date(t.createdAt).toLocaleString();

  overlay.classList.add("active");

});

    });

  } catch (err) {
    console.error(err);
    alert("Error loading transactions");
  }

  // =========================
  // 🚪 LOGOUT
  // =========================
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }

  // =========================
  // ❌ CLOSE MODAL
  // =========================
  const overlay = document.getElementById("transactionOverlay");

  if (overlay) {
    document.getElementById("closeModal").onclick = () => {
      overlay.classList.remove("active");
    };

    overlay.onclick = (e) => {
      if (e.target.id === "transactionOverlay") {
        overlay.classList.remove("active");
      }
    };
  }

  // =========================
  // 📥 DOWNLOAD RECEIPT
  // =========================
  const downloadBtn = document.getElementById("downloadReceipt");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {

      const text = `
Transaction Receipt

Amount: ${document.getElementById("modalAmount").textContent}

From: ${document.getElementById("modalFromName").textContent}
Account: ${document.getElementById("modalFromNumber").textContent}

To: ${document.getElementById("modalToName").textContent}
Account: ${document.getElementById("modalToNumber").textContent}

Type: ${document.getElementById("modalBank").textContent}

Date: ${document.getElementById("modalDate").textContent}

Status: Successful
`;

      const blob = new Blob([text], { type: "text/plain" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "receipt.txt";
      link.click();
    });
  }

  // =========================
  // 📤 SHARE RECEIPT
  // =========================
  const shareBtn = document.getElementById("shareReceipt");

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {

      const text = `
Transaction

Amount: ${document.getElementById("modalAmount").textContent}

To: ${document.getElementById("modalToName").textContent}

Date: ${document.getElementById("modalDate").textContent}
`;

      if (navigator.share) {
        await navigator.share({
          title: "Transaction Receipt",
          text: text
        });
      } else {
        navigator.clipboard.writeText(text);
        alert("Receipt copied to clipboard");
      }
    });
  }

});