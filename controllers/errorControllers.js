// a global error handling middleware to handle all errors from the app
module.exports = (err, req, res, next) => {
  // read the status code from the response, a default status code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
