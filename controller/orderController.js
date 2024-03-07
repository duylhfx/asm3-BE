const Order = require("../model/Orders");
const User = require("../model/Users");
const Product = require("../model/Products");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const { PORT_MAILER, PASS_MAILER, USER_MAILER } = process.env;

// GET all orders by user
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate({
        path: "userId",
        select: "name phone address",
      })
      .select("userId totalPrice");
    return res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error get all orders!", status: 500 });
  }
};

// GET order by id
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "userId",
      select: "name phone address",
    });

    // error if id request is not admin
    if (req.user.role !== "admin") {
      // error if id request is not matched userId created
      if (order.userId._id.toString() !== req.user.userId)
        return res.status(500).json({ msg: "Unauthorized!" });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error get order by id!", status: 500 });
  }
};

// POST new Order
exports.postNewOrder = async (req, res) => {
  try {
    const { user, products, totalPrice } = req.body;

    // error when user input missing
    if (!user.name || !user.email || !user.phone || !user.address)
      return res
        .status(400)
        .json({ msg: "Input field is not empty!", status: 400 });

    // error when cart is empty
    if (products.length === 0)
      return res.status(400).json({ msg: "No product in cart!", status: 400 });

    // update user address
    await User.findByIdAndUpdate(user._id, { address: user.address });

    // creating new order
    const newOrder = {
      userId: user._id,
      products: products,
      totalPrice: totalPrice,
    };

    // init data to update inventory
    const updatedInventory = products.map((el) => ({
      _id: el.productId,
      quantity: el.quantity,
    }));

    // update order to database
    await Order.create(newOrder);

    // update inventory of product
    for (let i = 0; i < updatedInventory.length; i++) {
      const product = await Product.findById(updatedInventory[i]._id);

      if (!product.inventory)
        return res.status(400).json({
          msg: `Product ${product.name} is out of stock, pls remove it from cart`,
          status: 400,
        });

      await Product.findByIdAndUpdate(updatedInventory[i]._id, {
        $inc: { inventory: -updatedInventory[i].quantity },
      });
    }

    return res.status(200).json({ msg: "Order Created!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error creating order!", status: 500 });
  }
};

// POST Email after order successful
exports.postOrderEmail = async (req, res) => {
  try {
    const { user, products, totalPrice } = req.body;

    // error when user input missing
    if (!user.name || !user.email || !user.phone || !user.address)
      return res
        .status(400)
        .json({ msg: "Input field is not empty!", status: 400 });

    // data to fill in email content
    const order_data = {
      // Replace with actual user data from request or database
      userName: user.name,
      phoneNumber: user.phone,
      address: user.address,
      items: products,
      totalPrice: totalPrice.toLocaleString("de-DE"),
      tableRows: "",
    };

    // fill products in cart to email content
    for (const item of order_data.items) {
      order_data.tableRows += `
      <tr>
        <td><span class="math-inline">${item.name}</span></td>
        <td><img src=${item.img} alt=${item.name} width="100"></td>
        <td>${item.price.toLocaleString("de-DE")} VND</td>
        <td>${item.quantity}</td>
        <td>${(item.price * item.quantity).toLocaleString("de-DE")} VND</td>
      </tr>`;
    }

    // set mail option
    const mailOptions = {
      from: "hduy98155@gmail.com",
      to: user.email,
      subject: "Order Successful",
      html: fs
        .readFileSync(
          path.join(__dirname, "..", "mail-template", "mail-template.html"),
          "utf8"
        )
        .replace(/{{(.*)}}/g, (match, placeholder) => order_data[placeholder]),
    };

    // creating host to send mail
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: PORT_MAILER,
      auth: {
        user: USER_MAILER,
        pass: PASS_MAILER,
      },
    });

    // sending email notice to user
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ msg: "Email Sent Successful!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error sending Email!", status: 500 });
  }
};
