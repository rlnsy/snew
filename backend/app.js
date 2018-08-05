var express = require("express");
var bodyParser = require("body-parser");
var app = express();

var dbConfig = require('./db.js');
var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);

// Configuring Passport
var passport = require('passport');

var User = require('./model/user');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var expressSession = require('express-session');
app.use(expressSession({
  secret: 'mySecretKey'
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const cors = require('cors');
app.use(cors());

var routes = require("./routes/routes.js")(app);

var server = app.listen(8080, function() {
  console.log("Listening on port %s...", server.address().port);
});
