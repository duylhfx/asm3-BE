const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nestedSchema = new Schema({
  productId: { type: String, required: true, ref: "Product" },
  quantity: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
});

const orderSchema = new Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    products: [nestedSchema],
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
