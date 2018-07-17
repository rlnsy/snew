const apiURL = "http://vivalasalsa.ca/api/";

var AuthRequest = function(user, key) {
  this.user = user;
  this.key = key;
  this.status = 'new';
};

AuthRequest.prototype.stateGen = function() {
  return `{ "user": "${this.user}","key": "${this.key}" }`;
};

function decodeState(state) {
  var decode = JSON.parse(state);
  return {
    user: decode.user,
    key: decode.key
  }
}

var reqs = new Array();

function findRequest(user, key) {
  var request;
  for (r in reqs) {
    var select = reqs[r];
    if (select.user == user)
      request = select;
  } // TODO: hash and use a dictionary

  if (request == null)
    return {
      error: 'does not exist'
    };
  else if (key != request.key)
    return {
      error: 'key mismatch'
    };
  else
    return request;
}

function AuthURL(state) {
  this.clientId = "eaXyayShEsXmug";
  this.response_type = "code";
  this.state = state;
  this.redirect = apiURL + 'rauth/update';
  this.duration = "permanent";
  this.scope = "read,subscribe";
}

AuthURL.prototype.toString = function() {
  return `https://www.reddit.com/api/v1/authorize?`
    + `client_id=${this.clientId}&response_type=${this.response_type}`
    + `&state=${this.state}&redirect_uri=${this.redirect}`
    + `&duration=${this.duration}&scope=${this.scope}`;
}

var appRouter = function(app) {

  app.get("/", function(req, res) {
    res.send("This is the backend node for reddit-resub");
  });

  app.get("/rauth/make", function(req, res) {
    var user = req.query.user;
    var key = req.query.key;
    console.log('auth for user ' + user);
    var request = new AuthRequest(user, key);
    reqs.push(request);
    var url = new AuthURL(request.stateGen());
    res.send(url.toString());
  });

  app.get("/rauth/status", function(req, res) {
    var user = req.query.user;
    var key = req.query.key;
    var request = findRequest(user, key);
    if (request.error)
      res.send(request.error);
    else
      res.send(request.status);
  });

  app.get("/rauth/update", function(req, res) {
    // TODO: display a better landing page for redirect
    if (req.query.error) {
      res.send("there was an error authorizing reddit");
    } else {
      var stateInfo = decodeState(req.query.state);
      var user = stateInfo.user;
      var key = stateInfo.key;
      var request = findRequest(user, key);
      if (request.error) res.send('an internal error occurred');
      // TODO: retrieve token and save in request
      res.send(`user ${user} authorized!`);
    }
  });

  app.get("/rauth/retrieve", function(req, res) {
    // TODO: return the token and close close request
  });

}

module.exports = appRouter;
