// where route handlers are defined
//const fs = require('fs');
const { query } = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');
const { createClient } = require('redis');

// Create and connect the Redis client
const redisClient = createClient({
  host: 'localhost',
  port: 6379,
  // legacyMode: true,
});

// const client = redis.createClient({
//   legacyMode: true,
//   PORT: 5001,
// });
//redisClient.connect().catch(console.error);

//Handle Redis client connection errors
// redisClient.on('error', (error) => {
//   console.error('Redis client error:', error);
// });

DEFAULT_EXPIRATION = 36000;
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
// middleware
exports.aliasTopTours = (req, res, next) => {
  // pre-filling parts of the query objects
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
redisClient.connect();
exports.getAllTours = catchAsync(async (req, res) => {
  // Check if the Redis client is connected
  // Try to retrieve data from Redis cache

  let tours;
  let cachedData = await redisClient.get('tours');
  console.log('cached data');
  if (cachedData !== null) {
    // Data exists in Redis cache, parse it as JSON
    tours = JSON.parse(cachedData);
  } else {
    //Data not found in Redis cache, fetch from the database
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    tours = await features.query;

    // Store the data in Redis with an expiration time
    redisClient.setEx('tours', DEFAULT_EXPIRATION, JSON.stringify(tours));
  }

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

// refactor the route handlers as functions
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //=== Tour.findOne({ -id: req.params.id})
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: {
      tour,
    },
  });
});
// async await
exports.createTour = catchAsync(async (req, res) => {
  //   const newTour = new Tour({});
  //   newTour.save();
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});
exports.createTours = catchAsync(async (req, res) => {
  console.log(req[0]);
  for (var i in req.length) {
    const newTour = await Tour.create(req[i].body);
  }
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // query the document and update it
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    // validate the
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndRemove(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
  });
});

// mongoDB aggregation pipeline
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    // each element in the array will be one of the stages, as objects
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // not separate the tours by group, later we could group the tours by difficulty
        numTours: { $sum: 1 }, // for each document going through this pipeline, 1 will be added to numTours
        numRatings: { $sum: '$ratingsQuantity' }, // sum of all ratings
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      // use the fields of the aggregated results
      $sort: { avgPrice: 1 },
    },
    // {
    //   // repeat stages, excluding the easy
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  // Deconstructs an array field from the input documents to output a document for each element.
  // Each output document is the input document with the value of the array field replaced by the element.
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // extract the month from the startDates fields
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    // {
    //   $addFields: { month: '$_id' }, // name of the fields : value; equivalent to projection
    // },
    {
      $project: {
        _id: 0, //give each of the fields a 0, meaning not showing the _id
      },
    },
    {
      $sort: { numTourStarts: -1 }, // sort in descending order
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
