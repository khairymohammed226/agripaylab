const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  otpHash: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  atmCode: {
    type: String,
    required: true
  },

expiresAt: {
  type: Date,
  required: true,
  expires: 0
} ,

  used: {
    type: Boolean,
    default: false
  },

  attempts: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);