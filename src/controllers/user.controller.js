const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const scretKey = "csvscvsvsuwdvdfyd";
const moment = require("moment");


const register = async (req, res) => {
  try {
    const { email, name, password, role, confirmpass, mobile} = req.body;
    if (!email || !name || !password || !role || !mobile || !confirmpass) {
      throw new Error("please all feild required and fillup");
    }
    if (password !== confirmpass) {
      throw new Error("password does not match");
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error("user already existing this email");
    }
    const hashpassword = await bcrypt.hash(password, 8);

    const payload = {
      email,
      exp: moment().add(1, "days").unix(),
    };
    const token =await jwt.sign(payload, scretKey);
    const filter = {
      email,
      name,
      password: hashpassword,
      role,
      mobile,
      token,
    };
    const data = await User.create(filter);
    return res.status(200).json({ data: data, message: "created done" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      throw new Error("Invalid password");
    }

    const payload = {
      email: user.email,
    };

    const token = jwt.sign(payload, scretKey, { expiresIn: "1000m" });

    res.cookie("authToken", token, {
      httpOnly: true, // Secure cookie, not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Secure in production
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24, // 1 day expiry
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful",
      success: true,
      user,
  
      status: 200,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    let updatedData = { ...req.body };

    if (updatedData.password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(updatedData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true }       
    );

    res.status(200).json({ data: updatedUser, message: "User updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// const fetchListById = async (req, res) => {
//   try {
// const currentUser = req.user

// console.log(currentUser)
//     // if (!currentUser) {
//     //   throw new Error("User not found");
//     // }

//     if (currentUser.role === "admin") {
//       const allUsers = await User.find();
//       res.status(200).json({ data: allUsers, message: "All users retrieved" });
//     } else {
//       res
//         .status(200)
//         .json({ data: currentUser, message: "Your details retrieved" });
//     }
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

const fetchList = async (req, res) => {
  try {
    console.log("user", req.user);
  
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
    const skip = (page - 1) * limit; // Calculate skip value

    const users = await User.find() 
      .skip(skip)
      .limit(limit);
      

    const totalUsers = await User.countDocuments(); // Count total active users
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages,
      users,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedAt = new Date();
    const aggregationPipeline = [
      { $match: { _id: userId } },
      { 
        $set: { 
          isDeleted: true, 
          deletedAt: deletedAt 
        } 
      },
      { 
        $merge: { into: "users", whenMatched: "merge", whenNotMatched: "discard" } 
      }
    ];
console.log(deletedAt,"deletedAt");

    await User.aggregate(aggregationPipeline);

    const updatedUser = await User.findById(userId).select("name email isDeleted deletedAt");

    if (!updatedUser) {
      return res.status(500).json({ message: "Error fetching updated user details" });
    }

    return res.status(200).json({
      message: "User soft deleted successfully",
      user: updatedUser
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const myProfile = async(req,res)=>{
try {
  const user = req.user
   await User.find({user});
  return res.status(200).json({
    message: "You Can Show Profile With Login User",
    user: user
  });
} catch (error) {
  
}
}







module.exports = {
  register,
  fetchList,
  login,
  updateUser,
  deleteUser,
  myProfile,

};