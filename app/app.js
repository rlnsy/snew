const apiURL = "http://vivalasalsa.ca/api/";

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
      var response = await makeGetRequest(apiURL +
        'rauth?username=' + signInState.username);
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
