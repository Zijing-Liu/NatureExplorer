const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
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
    // hide the password from the response output
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE, be sure to call User.save() after updating password
      validator: function (el) {
        return el === this.password;
      },
      message: 'Invalid password',
    },
  },
});

// use the pre save middleware encrypt the data in the model
// executed between the moment receiving the data and persist the data in db
userSchema.pre('save', async function (next) {
  // only run this function if the password is modified
  if (!this.isModified('password')) return next();

  // hash the password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field,  not persist it to the db
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// user model has to be instantiated right after the definition of middleware function
const User = mongoose.model('User', userSchema);
module.exports = User;
