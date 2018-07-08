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
        this.signedIn = true;
        this.user.username = this.userEntry.username;
        this.userEntry.clear();
    }
  }
})
