const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    stripeCustomerId: String,
    balance: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
