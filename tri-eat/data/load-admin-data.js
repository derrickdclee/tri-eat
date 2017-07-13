require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const User = require('../models/User');

const adminUsers = JSON.parse(fs.readFileSync(__dirname + '/admin-data.json', 'utf-8'));

async function loadData() {
  try {
    await User.insertMany(adminUsers);
    console.log('successful');
    process.exit();
  } catch (err) {
    console.log(Err);
  }
}

loadData();
