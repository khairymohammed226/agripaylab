const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, otp) {
  try {
    const data = await resend.emails.send({
      from: "Agripay Bank <no-reply@agripay.online>",
      to: to,
      subject: "Your Verification Code 🔐",
      html: `
        <h2>Verify Your Email</h2>

        <p>Your OTP code is:</p>

        <h1 style="letter-spacing:6px; color:#0b6b4a;">
          ${otp}
        </h1>

        <p>This code expires in 10 minutes ⏱</p>

        <br>

        <p>If you didn’t request this, ignore this email.</p>

        <p>— Agripay Bank 💚</p>
      `
    });

    console.log("✅ OTP sent:", data);
  } catch (error) {
    console.log("❌ Email error:", error);
  }
}

module.exports = { sendOtpEmail };