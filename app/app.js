const apiURL = "http://vivalasalsa.ca";

var app = new Vue({
  el: '#app',
  data: {
    AUTH_STATES: {
      signedOut: 1,
      signedInNonAuth: 2,
      signedInAuth: 3
    },
    signInState: {
      authState: 0,
      username: null
    },
  },

  methods: {
    signIn: async function() {
      this.signInState.authState = this.AUTH_STATES.signedInNonAuth;
    },
    rAuthenticate: async function() {
      this.signInState.authState = this.AUTH_STATES.signedInAuth;
    }
  }
})

function makeGetRequest(url) {
  return new Promise(resolve => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        resolve(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  })
}
