
/* ======================================================
   عرض بيانات المستخدم من localStorage
====================================================== */
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
 if (!currentUser || !currentUser._id) {
  showBankMessage("Please log in first", "error");
  window.location.href = "login.html";
}
function showBankMessage(text, type) {
  const msg = document.getElementById("bankMessage");

  msg.textContent = text;
  msg.classList.remove("success", "error");
  msg.classList.add(type);
  msg.style.display = "block";
  

  if (type === "error") {
    setTimeout(() => {
      msg.style.display = "none";
    }, 6000);
  }
}


  function maskAccountNumber(acct) {
  const s = String(acct);
  if (s.length <= 4) return s;
  return "*".repeat(s.length - 4) + s.slice(-4);
}


 if (currentUser) {

  // عرض الاسم
  document.getElementById("userNameDisplay").textContent =
    currentUser.firstName + " " + currentUser.lastName;

  // جلب رقم الحساب من الكارت
  (async () => {
    try {
      const res = await fetch(`/card/${currentUser._id}`);

      if (res.ok) {
        const data = await res.json();

    

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



/* ======================================================
   عناصر الصفحة
====================================================== */
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const stepPwd = document.getElementById("stepPwd");

const confirmDiv = step2.querySelector(".confirm-details");
const backBtn = document.getElementById("backBtn");
const nextToPwd = document.getElementById("nextToPwd");
const pwdBack = document.getElementById("pwdBack");

const pwd = document.getElementById("pwd");
const pwdConfirm = document.getElementById("pwdConfirm");


// قراءة القيم من الخطوة الأولى
function getTransferValues() {
  const type = document.getElementById("transferType").value;

  return {
    transferType: type === "external" ? "external" : "internal",
    bank: document.getElementById("bank").value,
    beneficiaryName: document.getElementById("benefName").value,
    beneficiaryAccount: document.getElementById("benefAccount").value,
    amount: document.getElementById("amount").value
  };
}
/* ======================================================
   STEP 1 → STEP 2
====================================================== */
step1.addEventListener("submit", function (e) {
  e.preventDefault();

  const data = getTransferValues();
  const transferType = document.getElementById("transferType").value;

 if (!data.transferType) {
showBankMessage("Please select transfer type", "error");
return;
}

if (!data.beneficiaryName || !data.beneficiaryAccount || !data.amount) {
showBankMessage("Please fill all fields.", "error");
return;
}
  if (transferType === "external" && !data.bank) {
    showBankMessage("Please select a bank.", "error");
    return;
  }

const bankName =
data.transferType === "internal"
? "Same Bank Transfer"
: data.bank;
confirmDiv.innerHTML = `
<p><strong>Transfer Type:</strong> ${bankName}</p>
<p><strong>Name:</strong> ${data.beneficiaryName}</p>
<p><strong>Account:</strong> ${data.beneficiaryAccount}</p>
<p><strong>Amount:</strong> ${data.amount} EGP</p>
`;

  step1.style.display = "none";
  step2.style.display = "block";
});

/* ======================================================
   STEP 2 → BACK
====================================================== */
backBtn.addEventListener("click", function () {
  step2.style.display = "none";
  step1.style.display = "block";
});

/* ======================================================
   STEP 2 → STEP 3
====================================================== */
nextToPwd.addEventListener("click", function () {
  step2.style.display = "none";
  stepPwd.style.display = "block";
});

/* ======================================================
   STEP 3 → BACK
====================================================== */
pwdBack.addEventListener("click", function () {
  stepPwd.style.display = "none";
  step2.style.display = "block";
});

/* ======================================================
   STEP 3 → SUBMIT FINAL TRANSFER
====================================================== */
stepPwd.addEventListener("submit", async function (e) {
  e.preventDefault();

  const confirmBtn = stepPwd.querySelector("button[type='submit']");
  confirmBtn.disabled = true;
showBankMessage("", "success");
  const data = getTransferValues();

  if (pwd.value !== pwdConfirm.value) {
    showBankMessage("Passwords do not match", "error");
    confirmBtn.disabled = false;
    return;
  }

  try {

    const check = await fetch(`/transfer/check-card-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUser._id,
        password: pwd.value
      })
    });

    const checkResult = await check.json();

    if (!check.ok) {
      showBankMessage(checkResult.message || "Incorrect password", "error");
      confirmBtn.disabled = false;
      return;
    }

    const bodyData = {
  userId: currentUser._id,
  transferType: data.transferType,
  beneficiaryName: data.beneficiaryName,
  beneficiaryAccount: data.beneficiaryAccount,
  amount: data.amount
};

if (data.transferType === "external") {
  bodyData.bank = data.bank;
}

const transfer = await fetch(`/transfer/bank-transfer`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(bodyData)
});

    const transResult = await transfer.json();

    if (!transfer.ok) {
      showBankMessage(transResult.message || "Transfer failed", "error");
      confirmBtn.disabled = false;
      return;
    }

    currentUser.balance = transResult.newBalance;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    showSuccessBox();

  } catch (err) {
    console.error(err);
    showBankMessage("Server error", "error");
    confirmBtn.disabled = false;
  }
});
pwd.addEventListener("input", () => {
document.getElementById("bankMessage").style.display = "none";
});
const transferType = document.getElementById("transferType");
const bankSelect = $('#bank');

transferType.addEventListener("change", function () {

  bankSelect.val(null).trigger('change');

  if (this.value === "external") {

    bankSelect.next('.select2-container').show();
    bankSelect.prop("required", true);

  } else {

    bankSelect.next('.select2-container').hide();
    bankSelect.prop("required", false);

  }

});
function showSuccessBox(){

document.getElementById("step1").style.display = "none";
document.getElementById("step2").style.display = "none";
document.getElementById("stepPwd").style.display = "none";

document.getElementById("successBox").style.display = "block";

}
function goDashboard(){
  window.location.href = "dashboard.html";
}

$('#bank').select2({

templateResult: formatBank,
templateSelection: formatBank,
placeholder: "Select Bank"

});

function formatBank(bank) {

if (!bank.id) {
return bank.text;
}

const logo = $(bank.element).data('logo');

return $(
'<span style="display:flex;align-items:center;gap:12px;">' +
'<img src="' + logo + '" style="width:28px;height:28px;object-fit:contain;border-radius:4px;">' +
bank.text +
'</span>'
);

}

