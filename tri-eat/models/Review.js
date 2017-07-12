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
/*
  Note that populating pre 'save' didn't work!
*/
reviewSchema.pre('save', async function(next) {
  try {
    const author = await User.findOne({_id: this.author});
    let numReviews;
    let avgRating;

    if (author.ratingStat.numReviews === 0) {
      numReviews = 1;
      avgRating = this.rating.overall;
    } else {
      numReviews = author.ratingStat.numReviews + 1;
      avgRating = ( (author.ratingStat.avgRating * (numReviews - 1)) + this.rating.overall ) / numReviews;
    }

    const updates = {
      ratingStat: {
        numReviews, avgRating
      }
    };

    const updatedAuthor = await User.findOneAndUpdate({_id: this.author},  updates, {
      new: true,
      runValidators: true
    });
    console.log(updatedAuthor);
  } catch (err) {
    console.log(err);
  }

  next();
});

module.exports = mongoose.model('Review', reviewSchema);
