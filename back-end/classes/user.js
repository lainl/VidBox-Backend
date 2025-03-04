const { default: mongoose } = require("mongoose");

class User {
  constructor(email, userId, username, password, profilePicture, bio, creationDate, uploadedVidsIDList, uploadedCommentsIDList) {
    this.email = email;
    this.userId = userId;
    this.username = username;
    this.password = password;
    this.profilePicture = profilePicture;
    this.bio = bio;
    this.creationDate = creationDate;
    this.uploadedVidsIDList = uploadedVidsIDList;
    this.uploadedCommentsIDList = uploadedCommentsIDList;
  }

  toString() {
    return `User: 
    {ProfilePic: ${this.profilePicture}, 
      email: ${this.email},
       userID: ${this.userId},
        username: ${this.username},
         password: ${this.password},
          bio: ${this.bio},
           creationDate: ${this.creationDate}, 
           uploadedVidsIDList: ${this.uploadedVidsIDList}, 
           uploadedCommentsIDList: ${this.uploadedCommentsIDList} }`;
  }


}

const UserSchema = new mongoose.Schema({
  email: {
    type: string,
    index: { unique: true }
  },
  username: string,
  password: string
})

module.exports = mongoose.model(User, UserSchema);