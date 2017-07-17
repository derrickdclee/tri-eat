const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const User = mongoose.model('User');

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must provide an author!'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must provide a store!'
  },
  text: {
    type: String,
    required: 'Your review must have text!'
  },
  rating: {
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    ambiance: {
      type: Number,
      min: 1,
      max: 5
    },
    overall: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

reviewSchema.virtual('upvoteUsers', {
  ref: 'User',
  localField: '_id',
  foreignField: 'upvotes'
});

function autopopulate(next) {
  this.populate('author');
  next();
}

function calculateOverall(next) {
  this.rating.overall =
    (this.rating.food + this.rating.service + this.rating.ambiance) / 3;
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);
reviewSchema.pre('save', calculateOverall);
reviewSchema.pre('remove', async function(next) {
  // Undo the upvote
  User.updateMany(
    {upvotes: this._id},
    {
      $pull: {upvotes: this._id}
    },
    {
      multi: true,
      runValidators: true
    }
  ).exec(function(err, docs) {
    if (err) {
      next(err);
    } else {
      next();
    }
  });
});

module.exports = mongoose.model('Review', reviewSchema);
