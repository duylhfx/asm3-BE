const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const multer = require("multer");

// Define storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // Destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Rename the file
  },
});

// filter file input
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Initialize Multer with the storage configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// auth user by token jwt
const authUser = (req, res, next) => {
  const auth = req.user;
  // console.log("auth", auth);
  if (auth && auth.role !== "customer") {
    try {
      next();
    } catch (err) {
      console.log(err);
    }
  } else {
    return res.status(500).json({ msg: "Unauthorized" });
  }
};

//Dashboard
// Get all orders by user
router.get("/dashboard", authUser, adminController.getAdDashboard);

// Get all users
router.get("/users", authUser, adminController.getAdUsers);

// Get all products
router.get("/products", authUser, adminController.getAdProducts);

// POST new product
router.post(
  "/add-product",
  authUser,
  upload.fields([{ name: "images[]", maxCount: 4 }]),
  adminController.postAdNewProduct
);

// Get product by Id
router.get("/edit-product/:itemId", authUser, adminController.getAdEditProduct);

// Post update product by id
router.post(
  "/edit-product/:itemId",
  authUser,
  adminController.postAdEditProduct
);

// Post delete product
router.delete(
  "/delete-product/:itemId",
  authUser,
  adminController.postAdDeleteProduct
);

module.exports = router;
