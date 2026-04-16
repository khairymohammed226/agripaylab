const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(to, name) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev", // مؤقت
      to: to,
      subject: "Welcome 🎉",
      html: `<h2>Welcome ${name}</h2><p>Your account created successfully ✅</p>`
    });

    console.log("✅ Email sent:", data);
  } catch (error) {
    console.log("❌ Email error:", error);
  }
}

module.exports = { sendWelcomeEmail };