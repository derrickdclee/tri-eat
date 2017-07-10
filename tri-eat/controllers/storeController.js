const mongoose = require('mongoose');
const multer = require('multer');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); // yah we good, proceed
    } else {
      next({message: 'That filetype isn`t allowed!'}, false);
    }
  }
};
const jimp = require('jimp');
const uuid = require('uuid');

const Store = mongoose.model('Store'); // from start.js

//===========================================================================//
exports.homePage = (req, res) => {
  res.render('index', {title: 'Welcome to Tri Eat!'});
};

exports.addStore = (req, res) => {
  res.render('editStore', {title: 'Add Store'});
};

// upload to memory
exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
  console.log(req.body);
  // check if there is no new file to resize
  if (! req.file) {
    next();
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  // now we can resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO); // width is 800
  // save to disk
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  /*
    flash only works if we are using Sessions
    that's the only way data could persist from one request to the next
  */
  req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // Query the db for a list of all stores
  const stores = await Store.find();
  res.render('stores', {title: 'Stores', stores});
};

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) {
    throw Error('You must own a store in order to edit it');
  }
};

exports.editStore = async (req, res) => {
  const store = await Store.findOne({_id: req.params.id});
  confirmOwner(store, req.user);
  res.render('editStore', {title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req, res) => {
  // set the location data to be a Point
  // console.log(req.body);
  req.body.location.type = 'Point';

  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, // return the new store instead of the old one
    runValidators: true, // force the model to run validators
  }).exec(); // used in place of a callback function

  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`);
  res.redirect(`/stores/${store._id}/edit`);
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({slug: req.params.slug}).populate();
  if (! store) return next(); // let the error handlers handle it
  res.render('store', {store, title: store.name});
};

exports.getStoresByTag = async(req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || {$exists: true};
  // wait for multiple promises to come back!
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({tags: tagQuery});

  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render('tag', {tags, title: 'Tags', tag, stores});
};
