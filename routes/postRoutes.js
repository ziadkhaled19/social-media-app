const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const express = require("express");
const router = express.Router();

router.get("/getFeed", authController.protect, postController.getFeedPosts);
router.get("/getMyPosts", authController.protect, postController.getMyPosts);
router.get("/:id", authController.protect, postController.getPost);
router.delete("/:id", authController.protect, postController.deletePost);
router.post("/:id/like", authController.protect, postController.likePost);
router.post(
  "/:id/comment",
  authController.protect,
  postController.commentOnPost
);
router.delete(
  "/:id/comment/:commentId",
  authController.protect,
  postController.deleteComment
);
router.post("/", authController.protect, postController.uploadPostImage, postController.resizePostImage ,postController.createPost);
router.patch("/:id", authController.protect, postController.uploadPostImage, postController.resizePostImage ,postController.resizePostImage ,postController.updatePost);

module.exports = router;
