const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// READY?! Let's go!

// import all of our models
require('./models/User');
require('./models/Review');
require('./models/Store');

// Start our app!
const app = require('./app');
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New user connected');
  //console.log(io.sockets.sockets);
  socket.on('createReview', (message) => {
    socket.broadcast.emit('newReview', {message});
  });
});

app.set('port', process.env.PORT || 7777);
server.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${app.get('port')}`);
});
