const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const {catchErrors} = require('../handlers/errorHandlers');

// Do work here
// CANNOT have routes of the same form (duh)
router.get('/', storeController.homePage);
router.get('/stores', catchErrors(storeController.getStores));
router.get('/stores/page/:page', catchErrors(storeController.getStores));
router.get('/add',
  authController.isAdmin,
  storeController.addStore
);
/*
 1. Upload image to memory using multer
 2. Resize the image and save to disk using jimp
 3. And finally create the store
*/
router.post('/add',
  authController.isAdmin,
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
router.post('/add/:id',
  authController.isAdmin,
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
router.get('/stores/:id/edit',
  authController.isAdmin,
  catchErrors(storeController.editStore)
);
/*
  1. Get all the reviews associated with the store
  2. Get the authors
  3. For each author
*/
router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));
// router.get('/store/:slug/sortByUpvote', catchErrors(storeController.sortByUpvote));
router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.post('/delete/:id',
  authController.isAdmin,
  storeController.deleteStore
);

router.get('/trending', catchErrors(storeController.getTrending));

router.get('/login',
  authController.isNotLoggedIn,
  userController.loginForm
);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/register', userController.registerForm);

// 1. Validate user data
// 2. Register the user
// 3. Log them in
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);
router.get('/account',
  authController.isLoggedIn,
  userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
router.get('/map', storeController.mapPage);
router.post('/reviews/:storeId',
  authController.isLoggedIn,
  catchErrors(reviewController.addReview)
);
router.post('/reviews/:storeId/:reviewId',
  catchErrors(reviewController.canEditReview),
  catchErrors(reviewController.updateReview)
);
router.get('/store/:storeId/reviews/:reviewId/edit',
  authController.isLoggedIn,
  catchErrors(reviewController.canEditReview),
  catchErrors(reviewController.editReview)
);
router.post('/delete/reviews/:reviewId',
  catchErrors(reviewController.canEditReview),
  catchErrors(reviewController.deleteReview)
);

router.get('/top', catchErrors(storeController.getTopStores));
/*
  API
*/
router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));
router.get('/hearts',
  authController.isLoggedIn,
  catchErrors(storeController.getHearts)
);
router.post('/api/reviewer/:id/avg', catchErrors(userController.getAverageRating));
router.post('/api/reviews/:reviewId/upvote',
  authController.isLoggedIn,
  catchErrors(reviewController.upvoteReview)
);

module.exports = router;
