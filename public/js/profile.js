
  function showProfileMessage(text, type) {
  const msg = document.getElementById("profileMessage");

  msg.textContent = text;
  msg.className = "form-message " + type;
  msg.style.display = "block";

  setTimeout(() => {
    msg.style.display = "none";
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!user) {
      window.location.href = "login.html";
    return;
  }

  document.getElementById("firstName").textContent = user.firstName || "-";
  document.getElementById("lastName").textContent  = user.lastName || "-";
  document.getElementById("nationalId").textContent = user.nationalId || "-";
  document.getElementById("email").textContent = user.email || "-";
  document.getElementById("phone").textContent = user.phone || "-";

  if (user.dob) {
    document.getElementById("dob").textContent =
      new Date(user.dob).toLocaleDateString();
  } else {
    document.getElementById("dob").textContent = "-";
  }
});

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

const fields = ["firstName", "lastName", "email", "phone"];

editBtn.onclick = () => {
  fields.forEach(f => {
document.getElementById(f).style.display = "none";
    const input = document.getElementById(f + "Input");
    input.style.display = "inline-block";
input.value = document.getElementById(f).textContent;
  });

  editBtn.style.display = "none";
  saveBtn.style.display = "inline-block";
};

saveBtn.onclick = async () => {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));

  const updatedData = {};
  
  fields.forEach(f => {
  const inputVal = document.getElementById(f + "Input").value.trim();
  if (inputVal !== "") {
    updatedData[f] = inputVal;
  }
});

 const res = await fetch(`https://agripay.online/user/${user._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData)
  });

  if (!res.ok) {
    showProfileMessage("Failed to update data", "error");
    return;
  }

  const data = await res.json();
  sessionStorage.setItem("currentUser", JSON.stringify(data.user));

showProfileMessage("Profile updated successfully ✅", "success");

setTimeout(() => {
  location.reload();
}, 1000);};


document.getElementById("changePassBtn").onclick = () => {
  document.getElementById("passwordBox").style.display = "block";
};

document.getElementById("savePassBtn").onclick = async () => {
  const user = JSON.parse(sessionStorage.getItem("currentUser"));

 const oldPass = document.getElementById("oldPass").value;
const newPass = document.getElementById("newPass").value;
const confirm = document.getElementById("confirmPass").value;

  if (newPass !== confirm) {
   showProfileMessage("Passwords do not match", "error");
    return;
  }

 const res = await fetch(`/change-password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user._id, oldPass, newPass })
  });

  if (!res.ok) {
    showProfileMessage("Old password is incorrect", "error");

    return;
  }

  showProfileMessage("Password changed successfully", "success");
  location.reload();
};
const cancelBtn = document.getElementById("cancelBtn");

cancelBtn.onclick = () => {

  // 🧹 امسح القيم الصح
  document.getElementById("oldPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";

  // ❌ اقفل البوكس
  document.getElementById("passwordBox").style.display = "none";
};
