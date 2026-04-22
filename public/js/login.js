
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  function showLoginMessage(text, type) {
  const msg = document.getElementById("loginMessage");

  msg.textContent = text;
  msg.className = "form-message " + type;
  msg.style.display = "block";

  if (type === "error") {
    setTimeout(() => {
      msg.style.display = "none";
    }, 6000);
  }
}




  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!usernameInput || !password) {
      showLoginMessage("Please fill all fields", "error");     
 return;
    }

    try {
    const response = await fetch(`/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ username: usernameInput, password }),

      });

let data;

try {
  data = await response.json();
} catch {
  showLoginMessage("Invalid server response", "error");
  return;
}
      if (!response.ok) {
        showLoginMessage(data.message || "Username or password is incorrect", "error");
        return;
      }

      // حفظ البيانات بالـ fullname للعرض في الداش
const userData = {
  _id: data.user._id,
  firstName: data.user.firstName,
  lastName: data.user.lastName,
  username: data.user.username, 
  email: data.user.email,
  phone: data.user.phone,
  nationalId: data.user.nationalId,
  dob: data.user.dob,        // ✅
  balance: data.user.balance ?? 0
};


      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(userData));
localStorage.setItem("isLoggedIn", "true");
     showLoginMessage("Login successful", "success");
      window.location.href = "dashboard.html";

    } catch (err) {
      console.error("Fetch error:", err);
      showLoginMessage("Server error. Please try again later.", "error");
    }
  });
});
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  if (!passwordInput) return;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}







