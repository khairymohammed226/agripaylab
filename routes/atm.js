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

module.exports = router;