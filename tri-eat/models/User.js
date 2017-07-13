const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
// this package will take care of the password
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please provide an email address'
  },
  name: {
    type: String,
    required: 'Please provide a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [
    {type: mongoose.Schema.ObjectId, ref: 'Store'}
  ],
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

userSchema.virtual('gravatar').get(function() {
  // not actually stored in the database
  // virtual fields are generated "on the fly"
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.statics.getAverageRating = function(user) {

  return this.aggregate([
    {$match: {_id: mongoose.Types.ObjectId(user)}},

    {
      $lookup: {from: 'reviews', localField: '_id', foreignField: 'author', as: 'user_reviews'}
    },

    {
      $project: {
        avgRating: {$avg: '$user_reviews.rating.overall'}
      }
    }

  ]);
};

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
