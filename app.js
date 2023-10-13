// everything about the application configuration
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');

// upon calling, add a  bunch functions to app
const app = express();
app.set('view engine', 'pug');
// using path.join to prevent any path ending with a / conflicts with '/views/'
app.set('views', path.join(__dirname, 'views'));

// 1️⃣  MIDDLEWARE: function to modify the incoming data
//console.log(process.env.ENV_NODE);

// static middleware, serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.ENV_NODE === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
// since we didn't specify any route, this middleware applies to ever single request
// it can be run because it is before the request-response cycle of the request handler
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2️⃣ EVENT HANDLER
// 3️⃣ ROUTES
// import routes (as small applications), the routers here are actually middleware
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// mount the specified middleware functions at the path specified.
app.use('/', viewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('api/v1/reviews', reviewRouter);
// middleware to handle unhandled routes; app.all() runs for all the http methods
app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server`));
});

app.use(globalErrorHandler);
// app.route returns a instance of a single route, which can then be used to handle http request
// we actually create an app for each resource
module.exports = app;
