const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationalId: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    balance: { type: Number, default: 10000 },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // 🔥 الجديد
    isVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    otpExpires: { type: Date }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);