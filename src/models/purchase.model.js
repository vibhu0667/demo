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
        quantity: {
          type: Number, 
          required: true,
          min: 1,
        },
        price:{
          type:Number,

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
