const Product = require("../model/Products");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error get all products!" });
  }
};

// GET Product By Id
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    return res.status(200).json(product);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Error find product by id!" });
  }
};
