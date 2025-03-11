const Cart = require("../models/purchase.model");
const Book = require("../models/book.model");

const addToCart = async (req, res) => {
  try {
    const userId = req.user;
    const { bookId, quantity } = req.body;

    const parsedQuantity = Number(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    
    if (book.totalstock < parsedQuantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
  
    let cart = await Cart.findOne({ userId }) || new Cart({ userId, items: [] });

    const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += parsedQuantity;
    } else {
      cart.items.push({ bookId, quantity: parsedQuantity });
    }

    book.totalstock -= parsedQuantity;
    await Promise.all([book.save(), cart.save()]);

    const message = book.totalstock === 0
      ? `Book '${book.bname}' is now out of stock`
      : "Book added to cart";

    console.log(message);
    res.status(200).json({ message, cart });

  } catch (error) {
    console.error("Error in addToCart:", error);
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