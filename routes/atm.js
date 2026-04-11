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

    const { userId } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

 await Otp.create({
  userId,
  otpHash,
  amount,
  atmCode,
  expiresAt,
  used: false // 🔥 ضيف دي
});

    res.json({ otp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Card = require("../models/card");

router.post("/withdraw", async (req, res) => {
  try {
    const { userId, otp, atmCode, pin, amount } = req.body;

    if (!userId || !otp || !atmCode || !pin || !amount) {
      return res.status(400).json({ message: "Missing data ❌" });
    }

    // 🟢 نجيب OTP
    const otpDoc = await Otp.findOne({
      userId,
      atmCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "OTP expired or invalid ❌" });
    }

    // 🔐 تحقق OTP
    const isOtpValid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP ❌" });
    }

    // 🟢 نجيب الكارد
    const card = await Card.findOne({ userId });
    if (!card) {
  return res.status(404).json({ message: "Card not found ❌" });
}

    // 🔐 تحقق PIN
    const isPinCorrect = await bcrypt.compare(pin, card.cardPassword);
    if (!isPinCorrect) {
      return res.status(400).json({ message: "Incorrect PIN ❌" });
    }

    // 🟢 نجيب المستخدم
     
     const user = await User.findById(userId);
    if (!user) {
  return res.status(404).json({ message: "User not found ❌" });
}

    // 💸 تحقق من المبلغ
    const amountNumber = Number(amount);
    if (amountNumber > otpDoc.amount) {
      return res.status(400).json({ message: "Amount exceeds limit ❌" });
    }
     
    if (amountNumber !== otpDoc.amount) {
  return res.status(400).json({ message: "Amount must match OTP ❌" });
}

    if (amountNumber > user.balance){
      return res.status(400).json({ message: "Insufficient balance ❌" });
    }

    // 💰 خصم الفلوس
    user.balance -= amount;
    await user.save();

    // 🔥 تسجيل العملية
    await Transaction.create({
      userId,
      amount,
      type: "withdraw",
      source: "ATM",
      direction: "out",
      createdAt: new Date()
    });

    // 🔒 استخدم OTP مرة واحدة
    otpDoc.used = true;
    await otpDoc.save();

    res.json({
      message: "Withdrawal successful 💸",
      newBalance: user.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
});

module.exports = router;