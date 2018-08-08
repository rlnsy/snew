var https = require('https'),
  passport = require('passport'),
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  RedditStrategy = require('passport-reddit').Strategy,
  client = require('../client');

//TODO: implement basic auth and make reddit register only

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

  // Static page servers for navigating users through authorization
  app.get('/signup/new', function(req, res) {
    res.sendfile('form.html', {
      root: __dirname + '/../public'
    });
  });

  app.get('/signup/confirm', function(req, res) {
    res.sendfile('done.html', {
      root: __dirname + '/../public'
    });
  });

  app.get('/signup/error', function(req, res) {
    res.sendfile('autherr.html', {
      root: __dirname + '/../public'
    });
  })

  // Reddit Token Retrieval Flow:
  // Send request
  app.get('/auth/reddit', function(req, res, next) {
    req.session.state = crypto.randomBytes(32).toString('hex');
    passport.authenticate('reddit', {
      state: req.session.state,
      duration: 'permanent',
    })(req, res, next);
  });

  // Handle Callback
  app.get('/auth/reddit/callback', function(req, res, next) {
    console.log('recieved auth callback')
    // Check for origin via state token
    if (req.query.state == req.session.state) {
      console.log('state confirmed');
      passport.authenticate('reddit', {
        // TODO: implement middle point for doing things?
        successRedirect: '/api/signup/confirm',
        // TODO: update fail dest
        failureRedirect: '/api/signup/error'
      })(req, res, next);
    } else {
      next(new Error(403));
    }
  });
  // end

}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Redirect user to registration form
  res.redirect('signup/new');
}

// Database

var User = require('../model/user');

function saveNewUser(id) {
  user = new User({
    'id': id,
  })
  user.save(function(err) {
    console.log('saving new user...');
    if (err) console.log(err);
  });
}

// Passport Strategy
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

module.exports = appRouter;
