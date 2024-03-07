const handleFile = require("../util/fileHelp").handleFile;
const io = require("../util/socket");
const Order = require("../model/Orders");
const User = require("../model/Users");
const Product = require("../model/Products");

//Dashboard
// GET dashboard
exports.getAdDashboard = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId");
    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error getting dashboard!", status: 500 });
  }
};

// post new product
exports.postAdNewProduct = async (req, res) => {
  try {
    const { name, shortDesc, longDesc, category, price, inventory } = req.body;
    const images = req.files;

    // conditions to valid input form
    if (!name || !shortDesc || !longDesc || !category || !price) {
      return res.status(400).json({ msg: "The input is not empty!" });
    }

    if (price < 1 || price > 1000000000) {
      return res
        .status(400)
        .json({ msg: "The price must be in range 1 - 1 billion!" });
    }

    if (images.length === 0) {
      return res.status(400).json({ msg: "please upload a image!" });
    }

    const newProduct = {
      name: name,
      img1: images["images[]"][0].path,
      img2: images["images[]"][1] ? images["images[]"][1].path : "",
      img3: images["images[]"][2] ? images["images[]"][2].path : "",
      img4: images["images[]"][3] ? images["images[]"][3].path : "",
      category: category,
      short_desc: shortDesc,
      long_desc: longDesc,
      price: price,
      inventory: inventory,
    };

    await Product.create(newProduct);

    return res.status(200).json({ msg: "Creating new product!" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ msg: "Error creating new product!", status: 500 });
  }
};

// Get all users
exports.getAdUsers = async (req, res) => {
  try {
    const users = await User.find();

    return res.status(200).json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error get all users!", status: 500 });
  }
};

// Get all products
exports.getAdProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select("name price img1 category")
      .sort("-updatedAt");

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ msg: "Error get all products!", status: 500 });
  }
};

// Get product by id
exports.getAdEditProduct = async (req, res) => {
  try {
    const { itemId } = req.params;
    const product = await Product.findById(itemId);

    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ msg: "Error get product by id!", status: 500 });
  }
};

// Post update product by id
exports.postAdEditProduct = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, shortDesc, longDesc, category, price, inventory } = req.body;

    // conditions to valid input form
    if (!name || !shortDesc || !longDesc || !category || !price) {
      return res.status(400).json({ msg: "The input is not empty!" });
    }

    if (price < 1 || price > 1000000000) {
      return res
        .status(400)
        .json({ msg: "The price must be in range 1 - 1 billion!" });
    }

    const editProduct = {
      name: name,
      category: category,
      short_desc: shortDesc,
      long_desc: longDesc,
      price: price,
      inventory: inventory,
    };

    await Product.findByIdAndUpdate(itemId, { $set: editProduct });
    return res.status(200).json({ msg: "Product updated!" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ msg: "Error get product by id!", status: 500 });
  }
};

// post delete product by id
exports.postAdDeleteProduct = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Product.findById(itemId);

    if (!item)
      return res.status(500).json({ msg: "Item not found!", status: 500 });

    // delete file in storeDisk
    item.img1 && handleFile(item.img1);
    item.img2 && handleFile(item.img2);
    item.img3 && handleFile(item.img3);
    item.img4 && handleFile(item.img4);

    // delete file in database
    await Product.findByIdAndDelete(itemId);
    // send socket data to client

    return res.status(200).json({ msg: "Item deleted!" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error delete Item!" });
  }
};

//     // send socket data to client
//     io.getIo().emit("editing", { ...result._doc });
//     return res.status(200).json({ msg: "Post updated!" });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ msg: "Error edit post!" });
//   }
// };
