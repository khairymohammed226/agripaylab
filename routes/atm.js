const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const Otp = require("../models/Otp"); // مهم المسار

router.post("/generate-otp", async (req, res) => {
  try {
    const { atmCode, pin, amount } = req.body;

    if (!atmCode || !pin || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    const userId = "TEST_USER_ID";

    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      userId,
      otpHash,
      amount,
      atmCode,
      expiresAt
    });

    res.json({ otp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ❌ Cancel OTP From Email
router.get("/cancel-otp/:id", async (req, res) => {

  try {

    const otpDoc = await Otp.findById(req.params.id)
      .populate("userId");

    if (!otpDoc) {

      return res.send(`
        <h2 style="font-family:Arial">
          OTP not found ❌
        </h2>
      `);

    }

    // ✅ لو already used
    if (otpDoc.used) {

      return res.send(`
        <h2 style="font-family:Arial;color:#e67e22;">
          This OTP is already used or cancelled ⚠️
        </h2>
      `);

    }

    // ❌ cancel OTP
    otpDoc.used = true;
    otpDoc.cancelled = true;

    // 🔒 block for 30 mins
    otpDoc.blockedUntil =
      new Date(Date.now() + 30 * 60 * 1000);

    await otpDoc.save();

    // ✅ success page
    res.send(`

<div style="
  font-family:Arial;
  background:#f4f6f8;
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
">

  <div style="
    background:white;
    padding:40px;
    border-radius:16px;
    box-shadow:0 10px 25px rgba(0,0,0,0.08);
    text-align:center;
    max-width:500px;
  ">

    <div style="
      width:80px;
      height:80px;
      background:#eafaf1;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      margin:0 auto 20px;
      font-size:40px;
    ">
      ✅
    </div>

    <h2 style="color:#0b6b4a;">
      Transaction Cancelled
    </h2>

    <p style="
      color:#555;
      line-height:1.8;
      margin-top:15px;
    ">
      Your withdrawal request has been cancelled successfully.
      <br><br>
      OTP generation has been blocked
      for <b>30 minutes</b> for your security.
    </p>

  </div>

</div>

`);

  } catch (err) {

    console.error(err);

    res.send(`
      <h2 style="font-family:Arial">
        Server error ❌
      </h2>
    `);

  }

});

module.exports = router;