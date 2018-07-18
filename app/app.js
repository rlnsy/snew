const apiURL = "http://vivalasalsa.ca/api/";

var dbConfig = {
  apiKey: "AIzaSyAgLfyANKhvunmuzFI1WT9t4hQ-7GMSjo4",
  authDomain: "snew-app.firebaseapp.com",
  databaseURL: "https://snew-app.firebaseio.com/",
  storageBucket: "snew-app.appspot.com"
};

try {
  firebase.initializeApp(dbConfig);
} catch (error) {
  console.log(error.message);
}

// Get a reference to the database service
var database = firebase.database();

function User(uid) {
  this.id = uid;
  this.authenticated = false;
  this.token = null;
}

var app = new Vue({
  el: '#app',
  data: {
    signInState: {
      authState: 0,
      user: null,
      authKey: null
    }, // TODO: save state in browser for refreshing
    AUTH_STATES: Object.freeze({
      signedOut: 1,
      signedInNonAuth: 2,
      signedInAuth: 3
    })
  },

  methods: {

    setUser: function(result) {
      this.signInState.user = new User(result.user.uid);
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
      var key = generateKey(16);
      this.signInState.authKey = key;
      var url = await makeGetRequest(apiURL +
        `rauth/make?user=${this.signInState.user.id}&key=${key}`);
      window.open(url);

    //TODO: use 'rauth retrieve' to refresh page state
    //TODO: adjust state based on reponses
    //this.signInState.authState = this.AUTH_STATES.signedInAuth;
    },

    refreshStatus: async function() {
      var response = await makeGetRequest(apiURL +
        `rauth/status?user=${this.signInState.user.id}`
        + `&key=${this.signInState.authKey}`);
      if (response) {
        var token = await makeGetRequest(apiURL +
          `rauth/retrieve?user=${this.signInState.user.id}`
          + `&key=${this.signInState.authKey}`);
        console.log(`Token got: ${token}`);
      }
    }
  }
})

const keyChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZacdefghijklmnopqrstuvwxyz123456789';
function generateKey(bits) {
  if (bits == 0) return ``;
  else {
    var charSelect = Math.floor(Math.random() * keyChars.length);
    return `${keyChars.charAt(charSelect)}` + generateKey(bits - 1);
  }
}

async function makeGetRequest(url) {
  return new Promise(resolve => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        resolve(xmlHttp.responseText);
      }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  });
}
