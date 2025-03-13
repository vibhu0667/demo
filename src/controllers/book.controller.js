const Book = require("../models/book.model");
const User = require("../models/user.model");
const moment = require("moment");

// const { cloudinary } = require("../helpers/cloudinary");


const createBook = async (req, res) => {
  try {
    const user = req.user;
    const { bname, author, type, price, totalstock } = req.body;

   
    let imageUrl = "";
    if (req.file) {
      imageUrl = req.file.path;
    }

    const newBook = new Book({
      bname,
      author,
      type,
      price,
      totalstock,
      image: imageUrl, 
      createdBy: user,
      createdAt: new Date(),
    });

    const savedBook = await newBook.save();

    return res.status(201).json({ data: savedBook, message: "Book created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const user = req.user;
    const { bookId } = req.body;
    const bookExists = await Book.findById(bookId);
    if (!bookExists) {
        return res.status(404).json({ message: "Book not found" });
    }
    const updatedAt = new Date();

    const aggregationPipeline = [
      { $match: { _id: bookExists._id } }, 
      { 
          $set: { 
            bname: bookExists.bname, 
                  author: bookExists.author, 
                  type: bookExists.type , 
            updatedBy: { 
                  id: user._id, 
                  name: user.name, 
                  email: user.email 
              },
              updatedAt: updatedAt
          } 
      },
      { 
          $merge: { into: "books", whenMatched: "merge", whenNotMatched: "discard" } 
      }
  ];

  await Book.aggregate(aggregationPipeline);
  const updateBook = await Book.findById(bookId).select("bname author")

    return res.status(200).json({
      message: "Book updated successfully",

      updatedBy: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      bname: updateBook.bname,
      author:updateBook.author,
      updatedAt: updatedAt
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const listBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const matchSearch = search
      ? {
          $match: {
            $or: [
              { bname: { $regex: search, $options: "i" } }, 
              { author: { $regex: search, $options: "i" } }, 
            ],
          },
        }
      : { $match: {} };

    console.log("matchSearch:", matchSearch);

    const booksAggregation = await Book.aggregate([
      matchSearch,
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      { $project: { bname: 1, author: 1, "createdBy.name": 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalBooks = await Book.countDocuments(search ? matchSearch.$match : {});
    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      page,
      limit,
      totalBooks,
      totalPages,
      books: booksAggregation,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const softDeleteBook = async (req, res) => {
  try {
      const user = req.user; 
      const { bookId } = req.body;

      const bookExists = await Book.findById(bookId);
      if (!bookExists) {
          return res.status(404).json({ message: "Book not found" });
      }
      const deletedAt = new Date();
      const aggregationPipeline = [
          { $match: { _id: bookExists._id } }, 
          { 
              $set: { 
                  isDeleted: true, 
                  deletedBy: { 
                      id: user._id, 
                      name: user.name, 
                      email: user.email 
                  },
                  deletedAt: deletedAt
              } 
          },
          { 
              $merge: { into: "books", whenMatched: "merge", whenNotMatched: "discard" } 
          }
      ];
      await Book.aggregate(aggregationPipeline);
      const updateBook = await Book.findById(bookId).select("bname author")

      return res.status(200).json({
          message: "Book soft deleted successfully",
          deletedBy: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
            bname: updateBook.bname,
            author:updateBook.author,
          deletedAt: deletedAt
      });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



module.exports = {
    createBook,
    updateBook,
    listBooks,
    softDeleteBook,
  };