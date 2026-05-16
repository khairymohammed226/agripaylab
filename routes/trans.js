const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Card = require("../models/card");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp");
const Transaction = require("../models/Transaction");
const rateLimit = require("express-rate-limit");
const {
  sendWithdrawalAlertEmail
} = require("../utils/email");

// 🔒 limiter
const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests, try again later"
});


// 🔢 Generate OTP
router.post("/generate-otp", otpLimiter, async (req, res) => {
  try {
    const { atmCode, pin, amount, userId } = req.body;

    if (!atmCode || !pin || !amount || !userId) {
      return res.status(400).json({ message: "Missing data ❌" });
    }

    const amountNumber = Number(amount);

    // 🟢 user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 🟢 card
    const card = await Card.findOne({ userId });
    if (!card) {
      return res.status(404).json({ message: "Card not found ❌" });
    }

    // 🔐 PIN check
    const isPinCorrect = await bcrypt.compare(pin, card.cardPassword);
    if (!isPinCorrect) {
      return res.status(400).json({ message: "Incorrect PIN ❌" });
    }

    // 💰 balance check
    if (amountNumber > user.balance) {
      return res.status(400).json({ message: "Insufficient balance 💸" });
    }

    // 🔒 check blocked OTP
const blockedOtp = await Otp.findOne({
  userId,
  cancelled: true,
  blockedUntil: { $gt: new Date() }
});

if (blockedOtp) {

  const remainingBlock = Math.floor(
    (new Date(blockedOtp.blockedUntil) - new Date()) / 60000
  );

  return res.status(400).json({
    message:
      `OTP generation blocked for ${remainingBlock} minutes ❌`
  });
}

// 🔒 prevent duplicate OTP
const existingOtp = await Otp.findOne({
  userId,
  atmCode,
  used: false,
  expiresAt: { $gt: new Date() }
});
    if (existingOtp) {

  const remainingTime = Math.floor(
    (new Date(existingOtp.expiresAt) - new Date()) / 1000
  );

  return res.status(200).json({
    message: "OTP already active ⏳",
    otpActive: true,
    remainingTime,
    amount: existingOtp.amount
  });
}

    // 🔢 generate
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const createdOtp = await Otp.create({
  userId,
  otpHash,
  amount: amountNumber,
  atmCode,
  expiresAt,
  used: false
});

await sendWithdrawalAlertEmail(
  user.email,
  user.username,
  amountNumber,
  atmCode,
  createdOtp._id
);

    res.json({
      message: "OTP created successfully ✅",
      otp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

// 💰 Generate Deposit OTP (بدون كارت)
router.post("/generate-deposit-otp", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: "Missing data ❌" });
    }

    const amountNumber = Number(amount);

    if (amountNumber <= 0) {
      return res.status(400).json({ message: "Invalid amount ❌" });
    }

    // 🟢 user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 🔒 check existing OTP
    const existingOtp = await Otp.findOne({
      userId,
      type: "deposit",
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOtp) {

  const remainingTime = Math.floor(
    (new Date(existingOtp.expiresAt) - new Date()) / 1000
  );

  return res.status(200).json({
    message: "OTP already active ⏳",
    otpActive: true,
    remainingTime,
    amount: existingOtp.amount
  });
}

    // 🔢 generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      userId,
      otpHash,
      amount: amountNumber,
      type: "deposit", // 🔥 مهم جدًا
      used: false,
      expiresAt
    });

    res.json({
      message: "Deposit OTP created ✅",
      otp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});


// 💸 Withdraw
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, otp, atmCode, pin, amount } = req.body;

    if (!userId || !otp || !atmCode || !pin || !amount) {
      return res.status(400).json({ message: "Missing data ❌" });
    }

    const amountNumber = Number(amount);

    // 🟢 OTP
    const otpDoc = await Otp.findOne({
      userId,
      atmCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

   if (!otpDoc) {

  const cancelledOtp = await Otp.findOne({
    userId,
    atmCode,
    cancelled: true,
    blockedUntil: { $gt: new Date() }
  });

  if (cancelledOtp) {

    const remainingBlock = Math.floor(
      (new Date(cancelledOtp.blockedUntil) - new Date()) / 60000
    );

    return res.status(400).json({
      message:
        `Transaction cancelled ⛔ OTP blocked for ${remainingBlock} minutes`
    });
  }

  return res.status(400).json({
    message: "OTP expired or invalid ❌"
  });
}

    const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    // 🟢 card
    const card = await Card.findOne({ userId });
    if (!card) {
      return res.status(404).json({ message: "Card not found ❌" });
    }

    const isPinCorrect = await bcrypt.compare(pin, card.cardPassword);
    if (!isPinCorrect) {
      return res.status(400).json({ message: "Incorrect PIN ❌" });
    }

    // 🟢 user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 💸 checks
    if (amountNumber > otpDoc.amount) {
      return res.status(400).json({ message: "Amount exceeds limit ❌" });
    }

    if (amountNumber > user.balance) {
      return res.status(400).json({ message: "Insufficient balance ❌" });
    }

    // 💰 withdraw
    user.balance -= amountNumber;
    await user.save();

    // 🧾 transaction
    await Transaction.create({
      userId,
      amount: amountNumber,
      type: "withdrawal",
      source: "ATM",
      direction: "out",
      createdAt: new Date()
    });

    // 🔒 mark OTP used
    otpDoc.used = true;
    await otpDoc.save();

    res.json({
      message: "Withdrawal successful 💸",
      newBalance: user.balance
    });

  } catch (err) {
    console.error("🔥 WITHDRAW ERROR:", err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.post("/verify-deposit-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP required ❌" });
    }

    const otpDoc = await Otp.findOne({
      type: "deposit",
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate("userId");

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP expired ❌" });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    
const user = otpDoc.userId;

// 🔥 هات الكارت
const card = await Card.findOne({ userId: user._id });

res.json({
  name: user.firstName + " " + user.lastName,
  accountNumber: card ? card.accountNumber : "No Account",
  amount: otpDoc.amount
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

router.post("/complete-deposit", async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP required ❌" });
    }

    const otpDoc = await Otp.findOne({
      type: "deposit",
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate("userId");

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP expired ❌" });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    const user = otpDoc.userId;

    // 💰 زيادة الرصيد
    user.balance += otpDoc.amount;
    await user.save();

    // 🧾 تسجيل العملية
    await Transaction.create({
      userId: user._id,
      amount: otpDoc.amount,
      type: "deposit",
      source: "ATM",
      direction: "in",
      createdAt: new Date()
    });

    // 🔒 قفل OTP
    otpDoc.used = true;
    await otpDoc.save();

    res.json({
      message: "Deposit successful 💰",
      newBalance: user.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
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

    // ✅ already cancelled
    if (otpDoc.used) {

      return res.send(`

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

    <h2 style="color:#e67e22;">
      OTP Already Used ⚠️
    </h2>

    <p style="
      color:#555;
      line-height:1.8;
      margin-top:15px;
    ">
      This transaction has already been cancelled
      or completed before.
    </p>

  </div>

</div>

      `);

    }

    // ❌ cancel OTP
    otpDoc.used = true;
    otpDoc.cancelled = true;

    // 🔒 block 30 mins
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