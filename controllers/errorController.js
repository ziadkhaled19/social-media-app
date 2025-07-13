const AppError = require("./../utils/AppError");

const castError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const duplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const jwtError = () => new AppError("Invalid token. Please log in again!", 401);
const jwtExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);
const sendErrorDev = (err, req, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    if (err.name === "CastError") err = castError(err);
    if (err.code === 11000) err = duplicateError(err);
    if (err.name === "ValidationError") err = validationError(err);
    if (err.name === "JsonWebTokenError") err = jwtError();
    if (err.name === "TokenExpiredError") err = jwtExpiredError();
    sendErrorProd(err, req, res);
  }
};
