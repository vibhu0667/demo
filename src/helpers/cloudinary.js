const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
//   cloud_name:process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET, 

cloud_name : "dcfg8hmpn",
api_key: "898716294668977" ,
api_secret: "KQ5BlMnlqnUBdMYlok5Kau82Njs",
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "book_images", 
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
