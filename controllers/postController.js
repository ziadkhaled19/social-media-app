const Post = require("../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const multer = require("multer");
const sharp = require("sharp");

const storage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

exports.uploadPostImage = upload.single("image");

exports.resizePostImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `post-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`imgs/posts/${req.file.filename}`);
  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  const image = req.file.filename;

  const post = await Post.create({
    content,
    image,
    user: req.user.id,
  });
  const newPost = await Post.findById(post.id)
    .populate({
      path: "user",
      select: " firstName lastName  photo",
    })
    .populate({
      path: "comments",
      select: "comment user",
      populate: {
        path: "user",
        select: " firstName lastName  photo",
      },
    })
    .populate({
      path: "likes",
      select: "user",
      populate: {
        path: "user",
        select: " firstName lastName ",
      },
    });
  res.status(200).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});

exports.commentOnPost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const { comment } = req.body;

  const post = await Post.findByIdAndUpdate(
    postId,
    {
      $push: {
        comments: {
          comment,
          user: req.user.id,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: "comments.user",
    select: " firstName lastName ",
  });

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { id, commentId } = req.params;

  //  find the post
  const post = await Post.findById(id).populate({
    path: "comments.user",
    select: " firstName lastName  photo",
  });

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  // Find the specific comment
  const comment = post.comments.id(commentId);
  if (!comment) {
    return next(new AppError("No comment found with that ID", 404));
  }

  // Check permissions
  if (
    comment.user._id.toString() !== req.user.id.toString() &&
    post.user.toString() !== req.user.id.toString()
  ) {
    return next(
      new AppError("You are not allowed to delete this comment", 401)
    );
  }

  // Update the post by pulling the comment
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $pull: {
        comments: { _id: commentId },
      },
    },
    { new: true }
  ).populate({
    path: "comments",
    select: "comment user",
    populate: {
      path: "user",
      select: " firstName lastName  photo",
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      post: updatedPost,
    },
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  const index = post.likes.findIndex(
    (like) => like.user.toString() === req.user.id.toString()
  );
  if (index === -1) {
    post.likes.push({ user: req.user.id });
    await post.save({ validateBeforeSave: false });
    return res.status(200).json({
      status: "success",
      message: "Post disliked successfully",
    });
  } else {
    post.likes.splice(index, 1);
  }
  await post.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "Post liked successfully",
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // get the post 
  const post = await Post.findById(id).populate("user");

  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }

  // Check if the current user is the owner of the post
  if (post.user._id.toString() !== req.user.id.toString()) {
    return next(new AppError("You are not allowed to delete this post", 401));
  }

  // delete the post
  await Post.deleteOne({ _id: id }); // == .remove()

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getFeedPosts = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("friends");
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  // Check if user has any friends
  if (!user.friends || user.friends.length === 0) {
    return res.status(200).json({
      status: "success",
      data: {
        posts: [],
      },
    });
  }
  const friendsPosts = await Post.find({ user: { $in: user.friends } })
    .select("-__v") // exclude version key
    .sort({ createdAt: -1 })
    .limit(20) // add pagination limit
    .populate({
      path: "user",
      select: " firstName lastName  photo",
    })
    .populate({
      path: "comments",
      select: "comment user",
      populate: {
        path: "user",
        select: " firstName lastName photo",
      },
    })
    .populate({
      path: "likes",
      select: "user",
      populate: {
        path: "user",
        select: " firstName lastName ",
      },
    });

  res.status(200).json({
    status: "success",
    results: friendsPosts.length,
    data: {
      posts: friendsPosts,
    },
  });
});

exports.getMyPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts: posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      post: post,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id: postId } = req.params;
  const userId = req.user.id;

  const content = req.body.content;
  const image = req.file.filename;

  if (!content && !image) {
    return next(
      new AppError(
        "You must provide either content or image to update a post",
        400
      )
    );
  }

  // new object with updated fields
  let updatedFields = {};
  if (content) updatedFields.content = content;
  if (image) updatedFields.image = image;

  // Find and update in one operation with validation
  const updatedPost = await Post.findOneAndUpdate(
    { _id: postId, user: userId }, 
    updatedFields, 
    {
      new: true, 
      runValidators: true, 
      context: "query", // Context for validators
    }
  );

  // If no post was found or user doesn't own it
  if (!updatedPost) {
    return next(
      new AppError(
        "Post not found or you don't have permission to update it",
        404
      )
    );
  }
  res.status(200).json({
    status: "success",
    data: {
      post: updatedPost,
    },
  });
});