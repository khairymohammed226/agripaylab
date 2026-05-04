document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const msg = document.getElementById("loginMessage");
  const btn = form.querySelector("button");

  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = "form-message " + type;
    msg.style.display = "block";

    if (type === "error") {
      setTimeout(() => {
        msg.style.display = "none";
      }, 5000);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      showMessage("Please fill all fields", "error");
      return;
    }

    // 🔒 منع الضغط مرتين
    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
      const response = await fetch(`https://bankingnew.onrender.com/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        showMessage("Invalid server response", "error");
        return;
      }

      if (!response.ok) {
        showMessage(data.message || "Login failed", "error");
        return;
      }

      // ✅ تأكد إن اليوزر موجود
      if (!data.user) {
        showMessage("User data missing", "error");
        return;
      }

      const userData = {
        _id: data.user._id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        username: data.user.username,
        email: data.user.email,
        phone: data.user.phone,
        nationalId: data.user.nationalId,
        dob: data.user.dob,
        balance: data.user.balance ?? 0
      };

      // 💾 session
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      sessionStorage.setItem("isLoggedIn", "true");

      showMessage("Login successful ✅", "success");

      // ⏳ سيبه ثانية عشان الرسالة تظهر
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);

    } catch (err) {
      console.error(err);
      showMessage("Server error. Try again later.", "error");
    } finally {
      // 🔓 رجع الزرار
      btn.disabled = false;
      btn.textContent = "Login";
    }
  });
});

function togglePassword() {
  const input = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");

  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}