const https = require('https');
const apiURL = 'http://vivalasalsa.ca/api/';
const redirect = apiURL + 'rauth/update';
const clientId = "eaXyayShEsXmug";
const secret = require('./client-secret');
const querystring = require('querystring');
const btoa = require('btoa');
const atob = require('atob');

// TODO: rework to use local database and authentication
// TODO: test

var AuthRequest = function(user, key) {
  this.user = user;
  this.key = key;
  this.authorized = false;
  this.token = null;
  this.state_id = null;
};

AuthRequest.prototype.stateGen = function() {
  this.state_id = btoa(`{ "user": "${this.user}","key": "${this.key}" }`);
  return this.state_id;
};

function basicAuthEncode(user, pass) {
  return 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
}

function decodeState(state) {
  var decode = JSON.parse(atob(state));
  return {
    user: decode.user,
    key: decode.key
  }
}

var reqs = {}

function findRequest(state) {
  var request = reqs[state];
  if (request == null)
    return {
      error: 'does not exist'
    };
  else if (decodeState(state).key != request.key)
    return {
      error: 'key mismatch'
    };
  else
    return request;
}

function AuthURL(state) {
  this.clientId = clientId;
  this.response_type = "code";
  this.state = state;
  this.redirect = redirect;
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
    var request = new AuthRequest(user, key);
    var state = request.stateGen()
    reqs[state] = request;
    var url = new AuthURL(state);
    res.send(url.toString());
  });

  app.get("/rauth/status", function(req, res) {
    // TODO: update front-end call
    var state = req.query.state;
    var request = findRequest(state);
    if (request.error)
      res.send(request.error);
    else {
      res.send({
        authorized: request.status
      });
    }
  });

  app.get("/rauth/update", function(req, res) {
    // TODO: display a better landing page for redirect
    if (req.query.error) {
      res.send("there was an error authorizing reddit");
    } else {
      var state = req.query.state;
      var request = findRequest(state);
      if (request.error)
        res.send("Could not find authorization request matching the provided user and key");
      var code = req.query.code;
      postTokenRetrieve(code).then(function(token) {
        request.token = token;
        request.authorized = true;
      });
      res.send(`User authorized; Refresh status to continue.`);
    }
  });

  app.get("/rauth/retrieve", function(req, res) {
    // TODO: update front-end call
    var request = findRequest(req.query.state);
    if (request.authorized) {
      var token = request.token;
      reqs.pop(request);
      res.send(token);
    }
    else res.send("token could not be found");
  });

}

async function postTokenRetrieve(code) {
  return new Promise(resolve => {
    var data = querystring.stringify({
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": redirect
    });

    var options = {
      hostname: 'ssl.reddit.com',
      port: 443,
      path: '/api/v1/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        'Authorization': basicAuthEncode(clientId, secret)
      }
    }

    var req = https.request(options, (res) => {
      var response = "";
      res.on("data", function(data) {
        response += data;
      });
      res.on("end", function() {
        resolve(JSON.parse(response).access_token);
      });
    });

    req.on('error', (e) => {
      console.error(e);
    });

    req.write(data); req.end();
  });
}

module.exports = appRouter;
