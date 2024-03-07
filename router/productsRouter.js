const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");

// Get all products
router.get("/", productController.getProducts);

// GET product by id
router.get("/:productId", productController.getProductById);

module.exports = router;
