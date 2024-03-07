const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

// Get all orders by user
router.get("/", orderController.getAllOrders);

// Get orders by id
router.get("/:orderId", orderController.getOrderById);

// post new order
router.post("/add-order", orderController.postNewOrder);

// Post mail after order successful
router.post("/send-email", orderController.postOrderEmail);

module.exports = router;
