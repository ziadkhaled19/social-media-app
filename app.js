const express = require("express");
const app = express();
app.use(express.json());
const morgan = require("morgan");
const helmet = require("helmet");

// files
const AppError = require("./utils/AppError");
const errorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

// middlewares
app.use(morgan("dev"));
app.use(helmet());

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);

// no route found
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handler
app.use(errorHandler);

// exporting the app
module.exports = app;
