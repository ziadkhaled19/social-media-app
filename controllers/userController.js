const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const sendEmail = require("../utils/Email");
const multer = require("multer");
const sharp = require("sharp");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`imgs/profilePicture/user-${req.user.id}-${Date.now()}.jpeg`);
  next();
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");
  if (req.file) {
    filteredBody.picture = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    data: {
      user,
    },
    status: "success",
  });
});

exports.getMyFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const friends = await Promise.all(
    user.friends.map((friend) => {
      return User.findById(friend);
    })
  );
  res.status(200).json({
    status: "success",
    friendsNumber: friends.length,
    data: {
      friends: friends,
    },
  });
});

exports.getUserFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const friends = await Promise.all(
    user.friends.map((friend) => {
      return User.findById(friend);
    })
  );
  res.status(200).json({
    status: "success",
    friendsNumber: friends.length,
    data: {
      friends: friends,
    },
  });
});

exports.addFriend = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const otherUser = await User.findById(req.params.id);
  if (!otherUser) {
    return next(new AppError("No user found with that ID", 404));
  }
  if (otherUser.confirmFriendship.includes(user.id)) {
    return next(new AppError("You already sent a friend request", 400));
  }
  if (user.friends.length === 200) {
    return next(
      new AppError("You can't add more friends, you reached the limit", 400)
    );
  }
  if (otherUser.friends.length === 200) {
    return next(
      new AppError(
        "This user can't add more friends, he reached the limit",
        400
      )
    );
  }
  otherUser.confirmFriendship.push(user.id);
  await otherUser.save({ validateBeforeSave: false });
  const message = `You've received a friend request from ${user.name}. You can accept the request by visiting: http://localhost:3000/api/v1/users/${user.id}/acceptFriendship`;
  await sendEmail({
    email: otherUser.email,
    subject: "Friend Request",
    message,
  });
  res.status(200).json({
    status: "success",
    message: "Friend request sent successfully",
  });
});

exports.acceptFriendship = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { confirmFriendship: req.params.id },
      $push: { friends: req.params.id },
    },
    { new: true, runValidators: true }
  );
  const otherUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      // $pull: { confirmFriendship: req.user.id }, XXX bec it is for the reciepient only
      $push: { friends: req.user.id },
    },
    { new: true, runValidators: true }
  );
  if (!user || !otherUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
      otherUser,
    },
  });
});

exports.unfriend = catchAsync(async (req, res, next) => {
  const userfriend = await User.findById(req.params.id);
  if (!userfriend.friends.includes(req.user.id)) {
    return next(new AppError("You are not friends with this user", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { friends: req.params.id },
    },
    { new: true, runValidators: true }
  );
  const otherUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $pull: { friends: req.user.id },
    },
    { new: true, runValidators: true }
  );
  if (!otherUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Unfriended successfully",
  });
});
