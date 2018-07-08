var app = new Vue({
  el: '#app',
  data: {
      userEntry: {
        username: '',
        password: '',
        clear: function() {
          this.username = '';
          this.password = '';
        }
      },
      user: {
        username: '',
      },
      signedIn: false,
  },

  methods: {
    signIn: function() {
        console.log('signing in user ' + this.userEntry.username);

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            console.log(xmlHttp.responseText);
        }
        xmlHttp.open("GET", "http://127.0.0.1/api/account?username=rowan", true);
        xmlHttp.send(null);

        this.signedIn = true;
        this.user.username = this.userEntry.username;
        this.userEntry.clear();
    }
  }
})
