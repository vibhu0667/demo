const express = require("express");
const {
  register,
  login,
  updateUser,
  // fetchListById,
  fetchList,
  deleteUser,
  myProfile,
  logout,
  changePass
} = require("../controllers/user.controller");
const { userAuth, } = require("../middleware/auth");
const { createBook ,softDeleteBook,updateBook,listBooks} = require("../controllers/book.controller");
const { userAuthRoleBase } = require("../middleware/role.auth");
const { addToCart,removeFromCart,myCard } = require("../controllers/purchase.controller");
const { upload } = require("../helpers/cloudinary");

const router = express();

router.post("/createuser", register);
router.post("/login",login);
router.put("/updateuser",userAuth(), updateUser);
// router.get("/listuserbyid", userAuth(), fetchListById);
router.get("/listuser", userAuth(), fetchList);
router.get("/myprofile", userAuth(), myProfile);
router.delete("/deleteuser",userAuth(), deleteUser);
router.post("/logout", userAuth(), logout);
router.put("/changepass", userAuth(), changePass);





router.post("/createbook",userAuth(),userAuthRoleBase("admin"), upload.single("image"),createBook );
router.get("/listbook", userAuth(),listBooks);
router.put("/updatebook",  userAuth(),userAuthRoleBase("admin"), upload.single("image"),updateBook);
router.delete("/deletebook",  userAuth(),userAuthRoleBase("admin"),softDeleteBook);


router.post("/addtocart",userAuth(),userAuthRoleBase("admin"),addToCart);
router.post("/removetocart",userAuth(),userAuthRoleBase("admin"),removeFromCart);
router.get("/mycard", userAuth(),myCard);



module.exports = router;