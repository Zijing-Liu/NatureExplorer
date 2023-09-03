// define schema
const slugify = require('slugify');
const mongoose = require('mongoose');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // specify the error if the field is missing
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
      trim: true,
    },
    // this will be aggregated from user input review
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      trim: true, // trim the white space at the beginning and the end will be cut
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // just the name of the image, as a reference, usually leave the images in the file system.
      required: [true, 'A tour must have a cover image'],
    },
    images: [String], // an array of type strings referencing the image array
    createdAt: {
      type: Date,
      default: Date.now(), // a timestamp in million seconds
      select: false, // hide this property from the client
    },
    startDates: [Date], // dates for an array of tour instances
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // include the virtuals to be part of the objects
  },
);

// virtual property. In Mongoose, a virtual is a property that is not stored in MongoDB.
// Virtuals are typically used for computed properties on documents.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7; //use a regular function because we need to access this
});

// create the model out of the schema, use upper case for models
// models are fancier constructors complied from the schema definitions
// 👀 pre DOCUMENT MIDDLEWARES, which runs before the .save() cmd and the .create() cmd
// AKA pre-save hook
tourSchema.pre('save', function (next) {
  // pass the name as lowercase
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// // post document middleware runs after all the pre-middleware executions are completed, so we have the finished document
// // as a param in the function
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });
// 👀 QUERY MIDDLEWARES // big difference is the 'find' keyword, meaning processing a query
// use this to only show non-secret tours, working as view
// use regular expression, apply to all functions starting with find (findOne, findOneAndUpdate...)
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  // this points to the current aggregation object
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
