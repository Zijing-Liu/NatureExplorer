// where route handlers are defined
//const fs = require('fs');
const { query } = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));
// middleware
exports.aliasTopTours = (req, res, next) => {
  // pre-filling parts of the query objects
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE THE QUERY; chaining the methods
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    //console.log(features);
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// refactor the route handlers as functions
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //=== Tour.findOne({ -id: req.params.id})
    res.status(200).json({
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: 'failed to get all tours',
    });
  }
};
// async await
exports.createTour = async (req, res) => {
  //   const newTour = new Tour({});
  //   newTour.save();
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    // query the document and update it
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      // validate the
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndRemove(req.params.id);
    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid data',
    });
  }
};

// mongoDB aggregation pipeline
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    // some comments
  }
};
