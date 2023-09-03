class APIFeatures {
  // 2 params, the mongoose query, and the node queryString
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // BUILD THE QUERY
  filter() {
    // 🍉 1a) FILTERING
    //hard copy of the query object, the ... copies all the fields of the obj (distructing)
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 🍉 1b) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    // match string and replace using callback to return the new string by adding a $ in front of the match, save to the queryStr
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr));
    // return the same entire object to allow other access to the object
    return this;
  }

  sort() {
    // 🧊 2 SORTING
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      //sort('price ratingsAverage');
    } else {
      // set the default sort by creation date
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 🍋 3. FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // minus is negation
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 📖 PAGINATION
    // by default display 100 results to the users
    // convert a string to a number by * 1
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page-2limit=10, 1-10, page 1, 11-20, page 2
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
