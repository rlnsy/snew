var client = require('./client'),
  snoowrap = require('snoowrap');

module.exports = {
  getInstance: function(user) {
    return new snoowrap({
      userAgent: 'sub-discovery API by u/snewapp',
      clientId: client.clientID,
      clientSecret: client.clientSecret,
      refreshToken: user.token
    });
  },
  getSubscriptions: function(user) {
    let r = this.getInstance(user);
    console.log('built instance');
    let userRef = r.getUser();
    console.log('got user');
    let subscriptionPromise = userRef.getSubscriptions();
    console.log('got subscription promise');
    return subscriptionPromise.then((result) => res.send(result));
  }
}
