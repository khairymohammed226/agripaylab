const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
enum: ["withdrawal", "deposit", "bank", "wallet"],
      required: true
    },

    bank: String,

    beneficiaryName: String,
    beneficiaryAccount: String,

    senderName: String,
    senderAccount: String,

    amount: {
      type: Number,
      required: true
    },

    source: {
      type: String,
      required: true
    },

    direction: {
      type: String, // "in" | "out"
    }
  },
  {
    timestamps: true   // ⭐⭐⭐ السطر المهم جدًا
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);