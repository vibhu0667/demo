const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const secretKey = "csvscvsvsuwdvdfyd";

const userAuth = () => async (req, res, next) => {
  try {
    // let token = req.cookies.authToken || req.headers.authorization?.replace("Bearer ", ""); 
    const { authToken } = req.cookies;
    // console.log(authToken);
  const token = authToken;
    if (!token) {
      throw new Error("Please authenticate");
    }

    const decoded = jwt.verify(token, secretKey);
    if (!decoded) {
      throw new Error("Invalid token");
    }

    let user = await User.findOne({ email: decoded.email });
    req.user = user;

    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { userAuth };
