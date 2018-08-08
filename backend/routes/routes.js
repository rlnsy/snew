var https = require('https'),
  passport = require('passport'),
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  RedditStrategy = require('passport-reddit').Strategy,
  client = require('../client');

//TODO: figure out how to handle callback without serving pages

var User = require('../model/user');

passport.use(new RedditStrategy({
  clientID: client.clientID,
  clientSecret: client.clientSecret,
  callbackURL: client.url + "/auth/reddit/callback"
},
  function(accessToken, refreshToken, profile, done) {
    console.log('authenticating user...');
    User.findOne({
      'id': profile.id
    }, function(err, result) {
      if (!result) {
        console.log('no record found for user, creating...');
        saveNewUser(profile.id);
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

  app.get('/session', ensureAuthenticated, function(req, res) {
    var user = req.user;
    var uid = user.id;
    res.send({
      authorized: true,
      user: uid
    });
  });

  app.get('/failauth', function(req, res) {
    res.send({
      authorized: false
    });
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
        successRedirect: '/api/session',
        failureRedirect: '/api/failauth'
      })(req, res, next);
    } else {
      next(new Error(403));
    }
  });

}

function saveNewUser(id) {
  user = new User({
    'id': id,
  })
  user.save(function(err) {
    console.log('saving new user...');
    if (err) console.log(err);
  });
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('auth/reddit');
}

module.exports = appRouter;
