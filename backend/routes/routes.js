var appRouter = function(app) {

  app.get("/", function(req, res) {
    res.send("This is the backend node for reddit-resub");
  });

  app.get("/account", function(req, res) {

    console.log(req.query.username);

    var accountMock = {
        "username": "rowan",
        "password": "pWord",
        "twitter": "@rowlindsay"
    }
    if(!req.query.username) {
        return res.send({"status": "error", "message": "missing username"});
    } else if(req.query.username != accountMock.username) {
        return res.send({"status": "error", "message": "wrong username"});
    } else {
        return res.send(accountMock);
    }
});

}

module.exports = appRouter;
