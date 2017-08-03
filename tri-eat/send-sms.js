
// Twilio Credentials
var accountSid = 'AC23e54e50f9c52838de8fa83a5b7c4656';
var authToken = 'b5634d27cc9f982e7c8a7574127e1b11';

//require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: "+821044430153",
    from: "+12156080971",
    body: "This is the ship that made the Kessel Run in fourteen parsecs?",
}, function(err, message) {
    console.log(message.sid);
});
