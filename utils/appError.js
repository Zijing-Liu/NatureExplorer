class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // all the errs are operational errors
    this.isOperational = true;
    // returns a string representing the point in the code at which Error
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
