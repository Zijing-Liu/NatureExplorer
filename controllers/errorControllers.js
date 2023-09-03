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
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  console.log('message', message);
  return new AppError(message, 404);
};
const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    el.message;
  });
  const message = `Invalid data input. ${errors.join('. ')}`;
  return new AppError(message, 404);
};

module.exports = (err, req, res, next) => {
  // read the status code from the response, a default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    console.log(err.name);
    // mark mongoose errors as operational errors so that can be handled globally
    let error = { ...err };
    // detect the CastError and create a new error from the CastError
    console.log(err.name);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === '11000') error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidatorError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
