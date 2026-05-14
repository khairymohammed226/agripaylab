function showWalletMessage(text, type) {
  const msg = document.getElementById("walletMessage");

  msg.textContent = text;
  msg.className = "atm-message " + type + " show";

  setTimeout(() => {
    msg.classList.remove("show");
  }, 6000);
}

  // ================================
  // 1) عرض بيانات اليوزر بعد اللوجن
  // ================================
 const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (currentUser) {

    // إخفاء رقم الحساب
    function maskAccountNumber(acct) {
      if (!acct) return "No Account";
      const s = String(acct).trim();
      if (s.length <= 4) return s;
      const last4 = s.slice(-4);
      const stars = "*".repeat(s.length - 4);
      return stars + last4;
    }

    // عرض الاسم
   document.getElementById("userNameDisplay").textContent =
  `${currentUser.firstName} ${currentUser.lastName}`;


    // عرض رقم الحساب المخفي
  // 🟢 جلب رقم الحساب من الكارت
(async () => {
  try {
    const res = await fetch(`/card/${currentUser._id}`)
    

    if (res.ok) {
      const data = await res.json();

      function maskAccountNumber(acct) {
        const s = String(acct);
        if (s.length <= 4) return s;
        return "*".repeat(s.length - 4) + s.slice(-4);
      }

      document.getElementById("accountNumberDisplay").textContent =
        maskAccountNumber(data.card.accountNumber);
    } else {
      document.getElementById("accountNumberDisplay").textContent =
        "No Account";
    }
  } catch (err) {
    console.error(err);
    document.getElementById("accountNumberDisplay").textContent =
      "No Account";
  }
})();

  }


  // ================================
  // 2) باقي كود التحويل (Wallet Steps)
  // ================================
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const confirmDiv = step2.querySelector('.confirm-details');
  const backBtn = document.getElementById('backBtn');

const walletSelect = document.getElementById("walletProvider");
const walletNumberInput = step1.querySelector('input[placeholder="Wallet Number"]');

const amountInput = step1.querySelector('input[placeholder="Amount"]');

amountInput.addEventListener("input", function () {

this.value = this.value.replace(/\D/g, '');

});
function validateWalletNumber(){

const provider = walletSelect.value;
const number = walletNumberInput.value;

if(number.length < 3) return true;

const prefix = number.substring(0,3);

const rules = {
vodafone:"010",
etisalat:"011",
orange:"012",
wepay:"015"
};

if(rules[provider] && prefix !== rules[provider]){

showWalletMessage("Invalid number for selected wallet", "error");
return false;

}

return true;

}



step1.addEventListener('submit', function(e){

e.preventDefault();

if(!validateWalletNumber()){
return;
}
walletNumberInput.addEventListener("input", function(){

validateWalletNumber();

});
    const data = {};
    [...step1.elements].forEach(el => { 
      if(el.tagName === 'INPUT') data[el.placeholder] = el.value; 
    });
    
    confirmDiv.innerHTML = '';
    for (let key in data){
      const p = document.createElement('p');
      p.textContent = `${key}: ${data[key]}`;
      confirmDiv.appendChild(p);
    }
    
    step1.style.display = 'none';
    step2.style.display = 'block';
  });

  backBtn.addEventListener('click', function(){
    step2.style.display = 'none';
    step1.style.display = 'block';
  });

step2.addEventListener("submit", async function (e) {
  e.preventDefault();

  const walletNumber = step1.querySelector('input[placeholder="Wallet Number"]').value;
  const amount = step1.querySelector('input[placeholder="Amount"]').value;
  const password = step2.querySelector('input[type="password"]').value;

  // 1️⃣ تحقق الباسورد
  const check = await fetch(`/transfer/check-card-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: currentUser._id,
      password
    })
  });

  const checkResult = await check.json();
  if (!check.ok) {
    showWalletMessage(checkResult.message || "Password incorrect", "error");
    return;
  }

  // 2️⃣ تنفيذ التحويل
  const res = await fetch(`/transfer/wallet-transfer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: currentUser._id,
      walletNumber,
      amount
    })
  });

  const data = await res.json();

  if (!res.ok) {
    showWalletMessage(data.message || "Transfer failed", "error");
    return;
  }

  // 3️⃣ نجاح العملية
  currentUser.balance = data.newBalance;
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));

showWalletMessage("Wallet transfer successful", "success");

document.getElementById("goDashboardBtn").style.display = "block";
  // 👇 نستنى 5 ثواني بعد ما الرسالة تظهر
  setTimeout(() => {
    step2.reset();
    step2.style.display = "none";
    step1.style.display = "block";
    step1.reset();
  }, 5000);
});

$('#walletProvider').select2({

placeholder: "Select Wallet",

templateResult: formatWallet,

templateSelection: formatWallet

});

function formatWallet(wallet){

if (!wallet.id) {
return wallet.text;
}

const logo = $(wallet.element).data('logo');

return $(
'<span style="display:flex;align-items:center;gap:10px;">' +
'<img src="' + logo + '" style="width:26px;height:26px;object-fit:contain;">' +
wallet.text +
'</span>'
);

}
document.getElementById("goDashboardBtn").addEventListener("click", function(){
window.location.href = "dashboard.html";
});


