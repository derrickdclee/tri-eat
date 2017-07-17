require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const User = require('../models/User');
const Review = require('../models/Review');
const Store = require('../models/Store');

const adminUsers = JSON.parse(fs.readFileSync(__dirname + '/admin-data.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json'));
const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json'));

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await Store.remove();
  await Review.remove();
  await User.remove();
  console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
  process.exit();
}

async function loadData() {
  try {
    await Store.insertMany(stores);
    await Review.insertMany(reviews);
    await User.insertMany(adminUsers);
    console.log('👍👍👍👍👍👍👍👍 Done!');
    process.exit();
  } catch(e) {
    console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}
