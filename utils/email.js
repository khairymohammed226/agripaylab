const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(to, otp) {
  try {
    const data = await resend.emails.send({
      from: "Agripay Bank <no-reply@agripay.site>",
      to: to,
      subject: "Your Verification Code 🔐",
    html: `
<div style="background:#f4f6f8; padding:40px 0; font-family:Arial,sans-serif;">
  
  <div style="
    max-width:520px;
    margin:0 auto;
    background:#ffffff;
    padding:35px;
    border-radius:14px;
    box-shadow:0 10px 25px rgba(0,0,0,0.08);
  ">

    <h2 style="color:#0b6b4a; margin-bottom:10px;">
      Email Verification 🔐
    </h2>

    <p style="color:#333; font-size:15px;">
      Use the verification code below to complete your request.
    </p>

    <div style="
      text-align:center;
      margin:30px 0;
      padding:20px;
      background:#f1f7f5;
      border-radius:12px;
    ">
      <span style="
        font-size:32px;
        letter-spacing:8px;
        font-weight:bold;
        color:#0b6b4a;
      ">
        ${otp}
      </span>
    </div>

    <p style="color:#555; font-size:14px;">
      This code will expire in <b>10 minutes</b>. Please do not share this code with anyone.
    </p>

    <div style="
      margin-top:20px;
      padding:12px;
      background:#fff4f4;
      border-radius:8px;
      font-size:13px;
      color:#a94442;
    ">
      ⚠️ For your security, Agripay will never ask you for this code.
    </div>

    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

    <p style="font-size:13px; color:#888;">
      — Agripay Bank 💚<br>
      Secure Banking. Trusted Experience.
    </p>

  </div>
</div>
`
    });

    console.log("✅ OTP sent:", data);
  } catch (error) {
    console.log("❌ Email error:", error);
  }
}




async function sendWelcomeEmail(to, username) {
  try {
    await resend.emails.send({
      from: "Agripay Bank <no-reply@agripay.site>",
      to: to,
      subject: `Welcome ${username} 👋 Your email has been verified successfully ✅`,
   html: `
<div style="background:#f4f6f8; padding:40px 0; font-family:Arial,sans-serif;">
  
  <div style="
    max-width:520px;
    margin:0 auto;
    background:#ffffff;
    padding:35px;
    border-radius:14px;
    box-shadow:0 10px 25px rgba(0,0,0,0.08);
  ">

    <h2 style="color:#0b6b4a; margin-bottom:15px;">
      Welcome ${username} 👋
    </h2>

    <p style="color:#333; font-size:15px; line-height:1.6;">
      We're excited to have you join <b>Agripay Bank</b>.
      Your email has been successfully verified, and your account is now fully active.
    </p>

    <p style="color:#333; font-size:15px; line-height:1.6;">
      With Agripay, you can securely manage your finances, perform fast transactions,
      and access modern banking features designed to make your life easier.
    </p>

    <p style="color:#333; font-size:15px; line-height:1.6;">
      Whether you're checking your balance, sending money, or using ATM services,
      everything is built to be simple, safe, and reliable.
    </p>

    <div style="
      background:#f1f7f5;
      padding:15px;
      border-radius:10px;
      margin:20px 0;
      font-size:14px;
      color:#333;
    ">
      🔒 Your security is our priority. Never share your login details or OTP with anyone.
    </div>

    <div style="text-align:center; margin:30px 0;">
      <a href="https://agripay.site" style="
        display:inline-block;
        background:#0b6b4a;
        color:white;
        padding:14px 24px;
        border-radius:10px;
        text-decoration:none;
        font-weight:bold;
        font-size:15px;
      ">
        Go to Your Dashboard
      </a>
    </div>

    <p style="color:#555; font-size:14px;">
      If you have any questions or need help, feel free to contact our support team anytime.
    </p>

    <hr style="border:none; border-top:1px solid #eee; margin:25px 0;">

    <p style="font-size:13px; color:#888;">
      — Agripay Team 💚<br>
      Smart Banking. Simple Experience.
    </p>

  </div>
</div>
` 
    });

    console.log("✅ Welcome email sent");
  } catch (error) {
    console.log("❌ Welcome email error:", error);
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail };