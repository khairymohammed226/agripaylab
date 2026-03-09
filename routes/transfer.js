router.post("/bank-transfer", async (req, res) => {
  try {

    const { userId, transferType, bank, beneficiaryName, beneficiaryAccount, amount } = req.body;

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.balance < amount)
      return res.status(400).json({ message: "Not enough balance" });

console.log("Transfer Type:", transferType);
    // SAME BANK فقط هنا المقارنة
    if (transferType === "internal") {

      const receiverCard = await Card.findOne({
        accountNumber: beneficiaryAccount
      });

      if (!receiverCard) {
        return res.status(404).json({ message: "Invalid account number" });
      }

      const receiver = await User.findById(receiverCard.userId);

      receiver.balance += Number(amount);
      await receiver.save();
    }


    // الخصم من المرسل (يحدث في الحالتين)
    user.balance -= Number(amount);
    await user.save();


    const transaction = new Transaction({
      userId,
      type: "bank",
      bank: transferType === "external" ? bank : "same-bank",
      beneficiaryName,
      beneficiaryAccount,
      amount,
      direction: "out",
      source: transferType
    });

    await transaction.save();

    res.json({
      message: "Transfer successful",
      newBalance: user.balance
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});