const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: Number, required: true, maxLength: 10 },
  address: String,
  role: {
    type: String,
    required: true,
    enum: ["admin", "customer", "consultant"],
  },
});

module.exports = mongoose.model("User", userSchema);
