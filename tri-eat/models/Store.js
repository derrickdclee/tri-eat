const mongoose = require('mongoose');
mongoose.Promise = global.Promise; // use the ES6 promise
const slug = require('slugs');
const sanitizeHTML = require('sanitize-html');

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

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    // aggregation pipeline
    { $unwind: '$tags' },
    { $group: {_id: '$tags', count: { $sum: 1} } },
    { $sort: {count: -1}}
  ]);
};

module.exports = mongoose.model('Store', storeSchema);
