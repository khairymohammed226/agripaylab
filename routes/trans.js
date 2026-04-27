const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Card = require("../models/card");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp");
const Transaction = require("../models/Transaction");
const rateLimit = require("express-rate-limit");

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

    // 🔒 prevent duplicate OTP
    const existingOtp = await Otp.findOne({
      userId,
      atmCode,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (existingOtp) {
      return res.status(400).json({ message: "OTP already active ⏳" });
    }

    // 🔢 generate
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpHash = await bcrypt.hash(otp.toString(), 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      userId,
      otpHash,
      amount: amountNumber,
      atmCode,
      expiresAt,
      used: false
    });

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
      return res.status(400).json({ message: "OTP already active ⏳" });
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
      return res.status(400).json({ message: "OTP expired or invalid ❌" });
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

module.exports = router;