const User = require("../model/Users");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

// Get user online
exports.getUser = async (req, res) => {
  try {
    // console.log("user", req.user);
    const decoded = req.user;
    const user = await User.findOne({ _id: decoded.userId }).select(
      "email name phone address role"
    );

    // console.log("user", user);
    return res.status(200).json(user);
  } catch (err) {
    return res.status(400).json({ msg: "Error to get user" });
  }
};

// sign up a new user
exports.postSignup = async (req, res) => {
  const errors = validationResult(req);

  // notice when the input is invalid
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array()[0]);
  }

  try {
    const { email, password, name, phone } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ msg: "Input field is not empty!" });

    // decode password
    const salt = await bcrypt.genSalt(10);
    const hashPw = await bcrypt.hash(password, salt);

    // creating new user after valid
    const newUser = {
      name: name,
      email: email,
      password: hashPw,
      phone: phone,
      address: "",
      role: "customer",
    };
    // creating new user
    const user = await User.create(newUser);

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "7d", // 7 days
    });

    // Create cookie
    // add token
    res.cookie("jwt", token, {
      httpOnly: true, // Prevent client-side JS access
      maxAge: 7 * 24 * 60 * 60 * 1000, //  7 days
      sameSite: "strict",
    });

    res.status(200).json({ msg: "New User Created!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error Creating New User!" });
  }
};

// user login
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);

  // notice when the input is invalid
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array()[0]);
  }

  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ msg: "Input field is not empty!" });

    const user = await User.findOne({ email: email });

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, {
      expiresIn: "7d", // 7 days
    });

    // Create cookie
    // add token
    res.cookie("jwt", token, {
      httpOnly: true, // Prevent client-side JS access
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "User login!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error login!" });
  }
};

// user logout
exports.getLogout = (req, res) => {
  try {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("userId", { httpOnly: true, sameSite: "strict" });
    return res.status(200).json({ msg: "User logout!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Logout failed" });
  }
};
