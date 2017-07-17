const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // use the ES6 promise
const slug = require('slugs');
const sanitizeHTML = require('sanitize-html');

const User = mongoose.model('User');
const Review = mongoose.model('Review');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter a store name' // set it to true and if it's not present show this message
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// defining indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({location: '2dsphere'});

storeSchema.virtual('reviews', {
  ref: 'Review', // what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

storeSchema.virtual('heartUsers', {
  ref: 'User',
  localField: '_id',
  foreignField: 'hearts'
});

storeSchema.pre('save', async function(next) {
  // if the name is not modified, skip this step
  if (!this.isModified('name')) {
    next();
    return;
  }
  this.slug = slug(this.name);
  // find other stores that have a slug of wes, wes-1, wes-2...
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({slug: slugRegEx});
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  next();
});

// this functionality needs to be extended
storeSchema.pre('save', function(next) {
  const sanitizedName = sanitizeHTML(this.name, {
    allowedTags: [],
    allowedAttributes: []
  });
  this.name = sanitizedName;
  next();
});

storeSchema.pre('remove', async function(next) {
  // remove only works when there is either a callback or exec
  await Review
    .find({store: this._id})
    .exec(async function(err, reviews) {
      if (err) {
        next(err);
      }
      // async/await might not work with forEach
      for (let i=0; i<reviews.length; i++) {
        await reviews[i].remove();
      }
    });

  // same for update
  User.updateMany(
    {hearts: this._id},
    {$pull:
      {hearts: this._id}
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

storeSchema.statics.getTagsList = function() {
  // returns a promise
  return this.aggregate([
    // aggregation pipeline
    { $unwind: '$tags' },
    { $group: {_id: '$tags', count: { $sum: 1} } },
    { $sort: {count: -1}}
  ]);
};

storeSchema.statics.getTopStores = function() {
  return this.aggregate([
    // $field === $$CURRENT.field

    // Look up Stores and populate their reviews
    {
      // this has nothing to do with virtual fields (something done by Mongoose)
      // where the fuck is this 'reviews' coming from? Mongoose takes 'Review' and automatically lowercases + adds an s

      // collection name, field name here, field name there, new field name to store
      $lookup: {from: 'reviews', localField: '_id', foreignField: 'store', as: 'review_docs'}
    },
    // Filter for stores that have 2 or more reviews
    { $match: {'review_docs.1' : {$exists: true} }  },
    // Add the average reviews field
    {
      $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        slug: '$$ROOT.slug',
        reviews: '$$ROOT.review_docs',
        avgRating: {$avg: '$review_docs.rating.overall'}
      }
    },
    // Sort it by our new field, highest reviews first
    {
      $sort: {avgRating: -1}
    },
    // Limit to at most 10
    { $limit: 10}
  ]);
};

function autopopulate(next) {
  this.populate('author');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
