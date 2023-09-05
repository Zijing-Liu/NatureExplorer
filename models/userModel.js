const mongoose = require('mongoose');
const validator = require('validator');
// name, email, photo, password, passwordConfirmed
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please create an unique username'],
  },

  email: {
    type: String,
    unique: true,
    require: [true, 'Please enter an email address'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },

  photo: {
    type: String,
    require: false,
  },

  password: {
    type: String,
    minlength: 8,
  },

  passwordConfirmed: {
    type: String,
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
