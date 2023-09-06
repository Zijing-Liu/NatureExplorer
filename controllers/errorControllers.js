const AppError = require('./../utils/appError');
// a global error handling middleware to handle all errors from the app

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // trust error, send the detailed operational errors to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // programming or other unknown error: don't leak the error details
  } else {
    // log the error to the console so that developers can know the errors
    // 1) log error
    console.error('ERROR 💥');
    console.log(err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;
  console.log('handle duplicate fields', appError);
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    el.message;
  });
  const message = `Invalid data input. ${errors.join('. ')}`;
  console.log('handle validation called', appError);
  return new AppError(message, 400);
};
module.exports = handleJWTError = (err) =>
  new AppError('Invalid token, please log in again', 401);
module.exports = (err, req, res, next) => {
  // read the status code from the response, a default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // mark mongoose errors as operational errors so that can be handled globally
    console.log(err.name);
    console.log(error.name);
    // detect the mongoose errors and create a new AppError from the CastError
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === '11000') error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidatorError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    sendErrorProd(error, res);
  }
};
