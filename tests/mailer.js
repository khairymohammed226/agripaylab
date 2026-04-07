const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "backendjavascript91@gmail.com",
    pass: "vlmz ndka ugub gvxc"
  }
});

// ✅ OTP
async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: `"Crédit Agricole Bank" <backendjavascript91@gmail.com>`,
    to,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`
  });
}

// ✅ Welcome
async function sendWelcomeEmail(to, name) {
  await transporter.sendMail({
    from: `"Crédit Agricole Bank" <backendjavascript91@gmail.com>`,
    to,
    subject: "Welcome to Our Bank 🎉",
    html: `
      <h2>Welcome ${name} 👋</h2>
      <p>We are happy to have you in our bank.</p>
      <p>Your account has been created successfully.</p>
      <hr>
      <b>Crédit Agricole Bank</b>
    `
  });
}

module.exports = { sendOtpEmail, sendWelcomeEmail };