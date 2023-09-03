// a global error handling middleware to handle all errors from the app
const sendErrorDev = (err, res) => {
  // trust error, send the detailed operational errors to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // programming or other unknown error: don't leak the error details
  } else {
    // log the error to the console so that developers can know the errors
    // 1) log error
    console.log('ERROR 💥', err);
    // 2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
module.exports = (err, req, res, next) => {
  // read the status code from the response, a default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'product') {
    sendErrorProd(err, res);
  }
};
