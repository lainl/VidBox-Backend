<<<<<<< Updated upstream
export default class user{
constructor(email, username, password){
=======
const { default: mongoose } = require("mongoose");

class User {
  constructor(email, userId, username, password, profilePicture, bio, creationDate, uploadedVidsIDList, uploadedCommentsIDList) {
>>>>>>> Stashed changes
    this.email = email;
    this.username = username;
    this.password = password;
}
<<<<<<< Updated upstream
toString() {
    return `User: { email: ${this.email}, username: ${this.username}, password: ${this.password} }`;
  }
}
=======

const UserSchema = new mongoose.Schema({
  email: {
    type: string,
    index: { unique: true }
  },
  username: string,
  password: string,
  profilePicture: string,
  userId: {
    type: int,
    index: {unique: true}
  },
  bio: string,
  creationDate: string,
  uploadedVidsIDList: string,
  uploadedCommentsIDList: string


})

module.exports = mongoose.model(User, UserSchema);
>>>>>>> Stashed changes
