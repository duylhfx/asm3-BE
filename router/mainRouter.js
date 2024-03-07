const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { body } = require("express-validator");
const User = require("../model/Users");
const bcrypt = require("bcryptjs");

// default router
router.get("/", (req, res) => {
  res.send("<h1>Hello Nodejs Server</h1>");
});

// get User online
router.get("/user", userController.getUser);

// User sign up
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage("Email invalid"),
    body("email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email already exists");
          } else {
            return true;
          }
        });
      })
      .withMessage("Email is already taken"),
    body("name")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Name must be at least 5 characters long"),
    body("password")
      .trim()
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("phone")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Phone must be at least 10 characters long"),
  ],
  userController.postSignup
);

// User login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false })
      .withMessage("Email invalid"),
    body("email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (!user) {
            return Promise.reject("The email was not found!");
          } else {
            return true;
          }
        });
      })
      .withMessage("The email was not found!"),
    body("password")
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then((user) => {
          return bcrypt.compare(value, user.password).then((isValid) => {
            if (!isValid) {
              return Promise.reject("The password is not match!");
            } else {
              return true;
            }
          });
        });
      })
      .withMessage("The password is not match!"),
  ],
  userController.postLogin
);

// User logout
router.get("/logout", userController.getLogout);

module.exports = router;
