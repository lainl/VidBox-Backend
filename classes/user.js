class User {
    constructor(email, username, password) {
      this.email = email;
      this.username = username;
      this.password = password;
    }
  
    toString() {
      return `User: { email: ${this.email}, username: ${this.username}, password: ${this.password} }`;
    }
  }
  
  module.exports = User;