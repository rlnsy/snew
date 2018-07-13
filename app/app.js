const apiURL = "http://vivalasalsa.ca/api/";

var dbConfig = {
  apiKey: "AIzaSyAgLfyANKhvunmuzFI1WT9t4hQ-7GMSjo4",
  authDomain: "snew-app.firebaseapp.com",
  databaseURL: "https://snew-app.firebaseio.com/",
  storageBucket: "snew-app.appspot.com"
};
//firebase.initializeApp(dbConfig).catch(function(error) {});

// Get a reference to the database service
var database = firebase.database();

var app = new Vue({
  el: '#app',
  data: {
    AUTH_STATES: Object.freeze({
      signedOut: 1,
      signedInNonAuth: 2,
      signedInAuth: 3
    }),
    signInState: {
      authState: 0,
      user: null
    },
  },

  methods: {

    setUser: function(result) {
      this.signInState.user = result.user.uid;
      this.signInState.authState = this.AUTH_STATES.signedInNonAuth;

      var database = firebase.database();
      firebase.database().ref('users/' + result.user.uid).set({
        isAPerson: true,
      });

    },

    signIn: async function() {
      var provider = new firebase.auth.GoogleAuthProvider();
      var result = await firebase.auth().signInWithPopup(provider).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log('fb auth error: ' + errorCode +
          ' ' + errorMessage);
      });
      this.setUser(result);
    },

    rAuthenticate: async function() {
      this.signInState.authState = this.AUTH_STATES.signedInAuth;
      var response = await makeGetRequest(apiURL +
        'rauth?username=' + this.signInState.username);
    }

  }
})

async function makeGetRequest(url) {
  console.log('making api call to get...');
  return new Promise(resolve => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        console.log('get recieved a response');
        resolve(xmlHttp.responseText);
      }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  });
}
