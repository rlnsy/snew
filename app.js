const apiURL = "http://vivalasalsa.ca/api/";

var app = new Vue({
  el: '#app',

  mounted: function() {
    this.refreshLoginState()
  },

  data: {
    login: {
      authed: false,
      user: null,
    },
    otherprop: 'other val'
  },

  methods: {
    refreshLoginState: function() {
      makeGetRequest(apiURL + 'session').then(res => {
        console.log(res);
        this.login.authed = res.authed;
        if (this.login.authed)
          this.login.user = res.user;
      });
    }
  }
});

async function makeGetRequest(url) {
  return new Promise(resolve => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        resolve(JSON.parse(xmlHttp.responseText));
      // return the object version
      }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
  });
}
