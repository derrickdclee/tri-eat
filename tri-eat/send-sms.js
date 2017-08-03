
// Twilio Credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

//require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

client.messages.create({
    to: "+15719267772",
    from: "+12156080971",
    body: "Hello baby!",
}, function(err, message) {
    console.log(message.sid);
});
