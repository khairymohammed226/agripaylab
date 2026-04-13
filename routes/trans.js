const Transaction = require("../models/Transaction");

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

    // 🟢 Card
    const card = await Card.findOne({ userId });
    if (!card) {
      return res.status(404).json({ message: "Card not found ❌" });
    }

    const isPinCorrect = await bcrypt.compare(pin, card.cardPassword);
    if (!isPinCorrect) {
      return res.status(400).json({ message: "Incorrect PIN ❌" });
    }

    // 🟢 User
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
      type: "withdraw",
      source: "ATM",
      direction: "out"
    });

    // 🔒 mark OTP used
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