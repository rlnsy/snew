var AuthRequest = function(user, key) {
  this.user = user;
  this.key = key;
  this.status = 'new';
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

var appRouter = function(app) {

  app.get("/", function(req, res) {
    res.send("This is the backend node for reddit-resub");
  });

  app.get("/rauth/make", function(req, res) {
    var user = req.query.user;
    var key = req.query.key;
    console.log('auth for user ' + user);
    reqs.push(new AuthRequest(user, key));
    res.send('<reddit url goes here>');
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

  app.get("/rauth/callback", function(req, res) {});

}

module.exports = appRouter;
