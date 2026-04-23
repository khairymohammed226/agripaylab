
    let currentAccountNumber = "";
    document.addEventListener("DOMContentLoaded", async () => {
    
      // 1️⃣ نجيب بيانات المستخدم من localStorage
      const stored = localStorage.getItem("currentUser");

      if (!stored) {
        alert("log in first");
        window.location.href = "login.html";
        return;
      }

      const localUser = JSON.parse(stored);

      if (!localUser._id) {
        alert("incomplete user data");
        window.location.href = "login.html";
        return;
      }

      try {
        // 2️⃣ نجيب أحدث بيانات المستخدم من السيرفر
        if (!localUser._id) {
  alert("Invalid user ID");
  window.location.href = "login.html";
  return;
}

const res = await fetch(`/user/${localUser._id}`);
        if (!res.ok) {
          throw new Error("User not found");
        }

        const user = await res.json();

        // 3️⃣ نحدّث localStorage بآخر بيانات
        localStorage.setItem("currentUser", JSON.stringify(user));
        // 4️⃣ نعرض الاسم والرصيد
        document.getElementById("fullname").textContent =
          `${user.firstName} ${user.lastName}`;

        document.getElementById("balance").textContent =
          user.balance;

        // 5️⃣ نجيب رقم الحساب من الكارت
        try {
         const cardRes = await fetch(`/card/${user._id}`)

          if (cardRes.ok) {
            const cardData = await cardRes.json();
            currentAccountNumber = cardData.card.accountNumber;
            // لو حابب تخفي الرقم
            function maskAccountNumber(acct) {
              const s = String(acct);
              if (s.length <= 4) return s;
              return "*".repeat(s.length - 4) + s.slice(-4);
            }

            document.getElementById("accountNumber").textContent =
              maskAccountNumber(cardData.card.accountNumber);
          } else {
            document.getElementById("accountNumber").textContent =
              "No Account";
          }
        } catch (cardErr) {
          console.error(cardErr);
          document.getElementById("accountNumber").textContent =
            "No Account";
        }

      } catch (err) {
        console.error(err);
        alert("error to loade data");
      }
    });
  

  
    document.addEventListener("DOMContentLoaded", async () => {

      const stored = localStorage.getItem("currentUser");
      if (!stored) {
        alert("log in first");
        window.location.href = "login.html";
        return;
      }

      const user = JSON.parse(stored);

      try {
const res = await fetch(`/transactions/${user._id}`)
        const transactions = await res.json();

        const list = document.getElementById("transactionsList");

        transactions.forEach(t => {
          const box = document.createElement("div");
          box.className = "transaction-box";
let title = "";
let details = "";

if (t.source === "ATM") {

  title = "ATM Transaction";
  details = `Type: ${t.type}`;
  amountSign = "";

}

else if (t.direction === "out") {

  title = "Transfer Sent";
  details = `
  To: ${t.beneficiaryName}<br>
  Bank: ${t.source}
  `;
  amountSign = "";

}

else if (t.direction === "in") {

  title = "Transfer Received";
  details = `
  From: ${t.senderName}<br>
  Bank: ${t.source}
  `;
  amountSign = "  ";

}

else {

  title = "Bank Transaction";
  details = "";

}

   box.innerHTML = `
<b>${title}</b>
<br>
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
          box.addEventListener("click", () => {

const overlay = document.getElementById("transactionOverlay");

document.getElementById("modalAmount").textContent =
t.amount + " EGP";

document.getElementById("modalFromName").textContent =
t.senderName || "You";

document.getElementById("modalFromNumber").textContent =
currentAccountNumber;

if(t.source === "Wallet"){
document.getElementById("modalToName").textContent = "Wallet";
}else{
document.getElementById("modalToName").textContent =
t.beneficiaryName || "Receiver";
}

document.getElementById("modalToNumber").textContent =
t.beneficiaryAccount || "----";

document.getElementById("modalBank").textContent =
t.source;

document.getElementById("modalDate").textContent =
new Date(t.createdAt).toLocaleString();

overlay.classList.add("active");

});
        });

      } catch (err) {
        console.error(err);
        alert("error loading");
      }
    });
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("logoutBtn").addEventListener("click", function(e) {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    window.location.href = "login.html";
  });
});
document.getElementById("closeModal").onclick = () => {
document.getElementById("transactionOverlay").classList.remove("active");
};

document.getElementById("transactionOverlay").onclick = (e) => {
if(e.target.id === "transactionOverlay"){
document.getElementById("transactionOverlay").classList.remove("active");
}
};


document.getElementById("downloadReceipt").addEventListener("click", () => {

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



document.getElementById("shareReceipt").addEventListener("click", async () => {

const text = `
Transaction

Amount: ${document.getElementById("modalAmount").textContent}

To: ${document.getElementById("modalToName").textContent}

Date: ${document.getElementById("modalDate").textContent}
`;

if(navigator.share){
await navigator.share({
title:"Transaction Receipt",
text:text
});
}else{
navigator.clipboard.writeText(text);
alert("Receipt copied to clipboard");
}

});
  
document.getElementById("logoutBtn").addEventListener("click", function() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
});