const mongoose = require('mongoose');
const Review = mongoose.model('Review');
const Store = mongoose.model('Store');

exports.addReview = async(req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.storeId;

  const newReview = new Review(req.body);
  await newReview.save();
  req.flash('success', 'Review has been saved!');
  res.redirect('back');
};

exports.canEditReview = async (req, res, next) => {
  const review = await Review.findOne({_id: req.params.reviewId});
  const owner = review.author;
  if (req.user._id.equals(owner._id) || req.user.isAdmin) {
    req.review = review;
    return next();
  } else {
    req.flash('error', 'Oops you don\'t have privilegs to edit this review');
    res.redirect('back');
  }
};

exports.editReview = async (req, res) => {
  const store = await Store.findOne({_id: req.params.storeId});
  res.render('editReview', {store, review: req.review});
};

exports.updateReview = async (req, res) => {
  const updatedReview = await Review.findOneAndUpdate({_id: req.params.reviewId}, req.body, {
    new: true,
    runValidators: true
  });

  req.flash('success', 'Review updated');
  res.redirect(`/`);
};

exports.deleteReview = async (req, res) => {
  const deletedReview = await Review.findOneAndRemove({_id: req.params.reviewId});

  req.flash('success', 'Review deleted');
  res.redirect('/');
};
