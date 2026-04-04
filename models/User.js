const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  pin: String,
  balance: Number
});

module.exports = mongoose.model("User", userSchema);