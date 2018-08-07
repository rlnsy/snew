var https = require('https'),
  passport = require('passport'),
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  RedditStrategy = require('passport-reddit').Strategy,
  client = require('../rclient');

//TODO: update front end / provide better views for welcome&login
  //TODO: figure out how to integrate vue with redirect

var User = require('../model/user');

passport.use(new RedditStrategy({
  clientID: client.clientID,
  clientSecret: client.clientSecret,
  callbackURL: "http://vivalasalsa.ca/api/auth/reddit/callback"
},
  function(accessToken, refreshToken, profile, done) {
    console.log('authenticating user...');
    User.findOne({
      'redditId': profile.id
    }, function(err, result) {
      if (!result) {
        console.log('no record found for user, creating...');
        user = new User({
          redditId: profile.id,
        })
        user.save(function(err) {
          console.log('saving new user...');
          if (err) console.log(err);
        });
        return done(err, user);
      } else {
        console.log('found user');
        return done(err, result);
      }
    });
    console.log('auth done.');
  }
));

var appRouter = function(app) {

  app.get('/', function(req, res) {
    res.send("This is the backend node for reddit-resub");
  });

  app.get('/home', ensureAuthenticated, function(req, res) {
    var user = req.user;
    var uid = user.redditId;
    res.send('Logged in as ' + uid);
  });

  app.get('/welcome', function(req, res) {
    res.send("Welcome! Log in with Reddit to begin");
  });

  app.get('/auth/reddit', function(req, res, next) {
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
    })(req, res, next);
  });

  app.get('/auth/reddit/callback', function(req, res, next) {
    console.log('recieved auth callback')
    // Check for origin via state token
    if (req.query.state == req.session.state) {
      console.log('state confirmed');
      passport.authenticate('reddit', {
        successRedirect: '/api/home',
        failureRedirect: '/api/welcome'
      })(req, res, next);
    } else {
      next(new Error(403));
    }
  });

}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('welcome');
}

module.exports = appRouter;
