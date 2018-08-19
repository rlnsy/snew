var https = require('https'),
  passport = require('passport'),
  crypto = require('crypto'),
  mongoose = require('mongoose'),
  RedditStrategy = require('passport-reddit').Strategy,
  client = require('../client'),
  snoowrap = require('snoowrap');

//TODO: implement basic auth and make reddit register only

var appRouter = function(app) {

  app.get('/', function(req, res) {
    res.send("This is the backend node for reddit-resub");
  });

  // A convenient endpoint for checking authenitcation
  // and getting all user info
  app.get('/session', function(req, res) {
    var info;
    if (req.isAuthenticated()) {
      res.send({
        authed: true,
        user: req.user
      });
    } else {
      res.send({
        authed: false,
        user: null
      });
    }
  });

  app.get('/reddit/subscriptions', function(req, res) {
    if (req.isAuthenticated()) {
      getSubscriptions(req.user) //stub
    /*
    r_ref = new snoowrap({
      userAgent: 'sub-discovery API by u/snewapp',
      clientId: client.clientID,
      clientSecret: client.clientSecret,
      refreshToken: req.user.token
    });
    r_ref.getUser().getSubscriptions().then((result) => res.send(result));
    */
    } else {
      res.send('Not signed in')
    }
  })

  // Static pages for guiding the user through authentication
  app.get('auth/prompt', function(req, res) {
    res.sendfile('auth_prompt.html', {
      root: __dirname + '/../public'
    });
  });

  app.get('/auth/confirm', function(req, res) {
    res.sendfile('done.html', {
      root: __dirname + '/../public'
    });
  });

  app.get('/auth/error', function(req, res) {
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
        successRedirect: '/api/auth/confirm',
        // TODO: update fail dest
        failureRedirect: '/api/auth/error'
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
  res.redirect('auth/prompt');
}

// Database

var User = require('../model/user');

function saveNewUser(id, name, token) {
  user = new User({
    'id': id,
    'name': name,
    'token': token
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
        saveNewUser(profile.id, profile.name, refreshToken);
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
