const mongoose = require('mongoose');
const promisify = require('es6-promisify');

const User = mongoose.model('User');

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'});
};

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register'});
};

// middleware to be used before registration
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That email is not valid').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirm password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {title: 'Register', body: req.body, flashes: req.flash()});
    return;
  }

  // no errors
  next();
};

exports.register = async (req, res, next) => {
  const user = new User({email: req.body.email, name: req.body.name});
  // register method is available from the passport package
  const register = promisify(User.register, User);
  // stores the hash of the password
  await register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render('account', {title: 'Edit Your Account'});
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    {_id: req.user._id},
    {$set: updates},
    {new: true, runValidators: true, context: 'query'}
  );
  req.flash('success', 'Updated the profile successfully');
  res.redirect('back');
};

exports.getAverageRating = async (req, res) => {
  const results = await User.getAverageRating(req.params.id);
  res.json(results);
};
