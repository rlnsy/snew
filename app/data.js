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
            callback(xmlHttp.responseText);
            console.log(xmlHttp.responseText);
        }
        xmlHttp.open("GET", "http://localhost:3000/account?username=rowan", true);
        xmlHttp.send(null);

        this.signedIn = true;
        this.user.username = this.userEntry.username;
        this.userEntry.clear();
    }
  }
})
