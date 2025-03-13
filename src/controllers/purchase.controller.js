const Cart = require("../models/purchase.model");
const Book = require("../models/book.model");

// discount buy 1 get 1 free 
const addToCart = async (req, res) => {
  try {
    const userId = req.user;
    const { bookId, quantity } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (quantity < 0 ||  quantity > 5 ) {
      return res.status(400).json({ message: "you can only select 5 quantity" });
    }

    if (book.totalstock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);
   console.log(itemIndex,"itemIndex");
   
    const discountStartDate = new Date("2025-03-08T00:00:00Z"); 
    const discountEndDate = new Date(discountStartDate);
    discountEndDate.setDate(discountStartDate.getDate() + 2);

    const today = new Date();

    let finalQuantity = quantity;
    let discountPrice = book.price;
    let discountApplied = false;


    if (today >= discountStartDate && today <= discountEndDate) {
      finalQuantity = quantity * 2; 
      discountPrice = quantity * book.price;
      discountApplied = true;
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += finalQuantity;
      cart.items[itemIndex].price += discountPrice;
    } else {
      cart.items.push({
        bookId,
        quantity: finalQuantity,
        price: discountPrice,
      });
    }
    book.totalstock -= finalQuantity;
    console.log(book.totalstock,"book.totalstock");
    
    await Promise.all([book.save(), cart.save()]);

    let message = "Book added to cart";
    if (book.totalstock === 0) {
      message = `Book '${book.bname}' is now out of stock`;
    }
    if (discountApplied) {
      message += ` (BOGO applied: ${quantity} Free)`;
    }

    res.status(200).json({ message, cart });

  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};


const removeFromCart = async (req, res) => {
  try {
    const userId = req.user;
    const { bookId } = req.body;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex((item) => item.bookId.toString() === bookId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Book not found in cart" });
    }

    const removedItem = cart.items[itemIndex];
    const { quantity } = removedItem;

    const book = await Book.findById(bookId);
    if (book) {
      book.totalstock += quantity; 
      await book.save();
    }

    cart.items.splice(itemIndex, 1);

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.status(200).json({ message: "Cart is empty now, removed successfully" });
    }
    await cart.save();
    res.status(200).json({ message: "Book removed from cart and stock restored", cart });

  } catch (error) {
    console.error("Error in removeFromCart:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};




module.exports = { addToCart,removeFromCart };