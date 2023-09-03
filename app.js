// everything about the application configuration
const express = require('express');
const morgan = require('morgan');

// upon calling, add a  bunch functions to app
const app = express();

// 1️⃣  MIDDLEWARE: function to modify the incoming data
console.log(process.env.ENV_NODE);

// external middleware

if (process.env.ENV_NODE === 'development') {
  app.use(morgan('dev'));
}

// static middleware
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
// since we didn't specify any route, this middleware applies to ever single request
// it can be run because it is before the request-response cycle of the request handler
app.use((req, res, next) => {
  console.log('hello from the middleware!!!! never forget to use next();');
  // never
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2️⃣ EVENT HANDLER

// 3️⃣ ROUTES
// import routes (as small applications), the routers here are actually middleware
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// mount the specified middleware functions at the path specified.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
//app.get('/api/v1/tours', getAllTours);
//app.get('/api/v1/tours/:id', getTour);
//app.post('/api/v1/tours', createTour);
//app.patch('/api/v1/tours/id', updateTour);
//app.delete('/api/v1/tours/id', deleteTour);

// app.route returns a instance of a single route, which can then be used to handle http request
// we actually create an app for each resource
module.exports = app;
