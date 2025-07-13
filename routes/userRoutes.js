const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const express = require("express");
const router = express.Router();

router.post("/signup", authController.signup);
router.get("/login", authController.login);
router.patch("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);

router.get("/getMe", authController.protect, userController.getMe);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.get("/friends", authController.protect, userController.getMyFriends);

router.get("/:id", authController.protect, userController.getUser);
router.get(
  "/:id/friends",
  authController.protect,
  userController.getUserFriends
);

router.post("/:id/addFriend", authController.protect, userController.addFriend);
router.post(
  "/:id/acceptFriendship",
  authController.protect,
  userController.acceptFriendship
);
router.post("/:id/unfriend", authController.protect, userController.unfriend);

module.exports = router;
