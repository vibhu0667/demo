const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    items: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "book",
          required: true,
        },
 
      },
    ],
  
  },
  
  {
    timestamps: true,
    versionKey: false,
  }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
