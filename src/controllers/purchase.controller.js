const Cart = require("../models/purchase.model");
const Book = require("../models/book.model");

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user
    const {  bookId, quantity } = req.body;

    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if enough stock is available
    if (book.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ bookId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ bookId, quantity });
      }
    }

    // Deduct the stock
    book.stock -= quantity;
    await book.save();
    await cart.save();
   
    // Check if stock reaches zero
    if (book.stock === 0) {
      console.log(`Book '${book.bname}' is now out of stock.`); // Log message (replace with SMS logic if needed)
    }

    res.status(200).json({ message: "Book added to cart", cart, });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Get total price of cart
const getTotalPrice = async (req, res) => {
  try {
    const userId = req.user;
    const cart = await Cart.findOne({ userId }).populate("items.bookId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalPrice += item.bookId.price * item.quantity;
    });

    res.status(200).json({ totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

module.exports = { addToCart, getTotalPrice };