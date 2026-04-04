const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Card = require("../models/Card");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp");

router.post("/generate-otp", async (req, res) => {
  try {
    const { atmCode, pin, amount, userId } = req.body;

    if (!atmCode || !pin || !amount || !userId) {
      return res.status(400).json({ message: "Missing data" });
    }

    const amountNumber = Number(amount);

    if (amountNumber <= 0) {
      return res.status(400).json({ message: "Invalid amount ❌" });
    }

    // 🟢 نجيب المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // 🟢 نجيب الكارد
    const card = await Card.findOne({ userId });
    if (!card) {
      return res.status(404).json({ message: "Card not found ❌" });
    }

    // 🔐 تحقق من PIN
    const isPinCorrect = await bcrypt.compare(pin, card.cardPassword);
    if (!isPinCorrect) {
      return res.status(400).json({ message: "Incorrect PIN ❌" });
    }

    // 💰 التحقق من الرصيد
    if (amountNumber > user.balance) {
      return res.status(400).json({ message: "Insufficient balance 💸" });
    }

    // 🔒 منع OTP مكرر
    const existingOtp = await Otp.findOne({
      userId,
      atmCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOtp) {
      return res.status(400).json({ message: "OTP already active ⏳" });
    }

    // 🔢 إنشاء OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      userId,
      otpHash,
      amount: amountNumber,
      atmCode,
      expiresAt
    });

    res.json({ otp });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;