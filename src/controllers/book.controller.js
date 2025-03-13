const Book = require("../models/book.model");
const User = require("../models/user.model");
const moment = require("moment");

const { cloudinary } = require("../helpers/cloudinary");
const mongoose = require("mongoose");


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
      createdBy: { _id: user.id, name: user.name,
        email: user.email,}, 
      createdAt: new Date(),
    });

    const savedBook = await newBook.save();

    return res.status(201).json({
      message: "Book created successfully",
      data: {
        bname: savedBook.bname,
        author: savedBook.author,
        type: savedBook.type,
        price: savedBook.price,
        totalstock: savedBook.totalstock,
        image: savedBook.image,
        createdBy: savedBook.createdBy, 
      },
    });

  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const user = req.user;
    const { bookId, totalstock } = req.body;
    const bookExists = await Book.findById(bookId);

    if (!bookExists) {
      return res.status(404).json({ message: "Book not found" });
    }

    const updatedAt = new Date();
    let updatedFields = {
      bname: bookExists.bname,
      author: bookExists.author,
      type: bookExists.type,
      totalstock: totalstock || bookExists.totalstock,
      updatedBy: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      updatedAt: updatedAt,
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "book_images",
      });
      updatedFields.image = result.secure_url; 
    }

    const aggregationPipeline = [
      { $match: { _id: bookExists._id } },
      { $set: updatedFields },
      { $merge: { into: "books", whenMatched: "merge", whenNotMatched: "discard" } },
    ];

    await Book.aggregate(aggregationPipeline);
    const updatedBook = await Book.findById(bookId).select("bname author totalstock imageUrl");

    return res.status(200).json({
      message: "Book updated successfully",
      updatedBy: updatedFields.updatedBy,
      bname: updatedBook.bname,
      author: updatedBook.author,
      totalstock: updatedBook.totalstock,
      imageUrl: updatedBook.image || bookExists.image, 
      updatedAt: updatedAt,
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

 // Ensure correct path

const listBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const createdBy = req.query.createdBy || null;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    const skip = (page - 1) * limit;

    let matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { bname: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }
    
    if (createdBy) {
      matchConditions.createdBy = new mongoose.Types.ObjectId(createdBy);
    }

    if (startDate && endDate) {
      matchConditions.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      matchConditions.createdAt = { $gte: startDate };
    } else if (endDate) {
      matchConditions.createdAt = { $lte: endDate };
    }

    const booksAggregation = await Book.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          bname: 1,
          author: 1,
          "createdBy.name": 1,
          "createdBy._id": 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalBooks = await Book.countDocuments(matchConditions);
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
          // deletedAt: deletedAt
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