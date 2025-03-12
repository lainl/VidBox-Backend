const { default: mongoose } = require("mongoose");

class Comment {
  constructor(commentId, postTime, content, userId) {
    commentId = this.commentId
    postTime = this.postTime
    content = this.content
    userId = this.userId
  }

  toString() {
    return `Comment: 
    {CommentID: ${this.commentId}, 
      PostTIme: ${this.postTime},
       Content: ${this.content},
        userID: ${this.userId},
         }`;
  }


}

const CommentSchema = new mongoose.Schema({
  commentId: {
    type: int,
    index: { unique: true }
  },
  postTime: string,
  content: string,
  userId: {
    type: int,
    index: {unique: true}
  },
  


})

module.exports = mongoose.model(Comment, CommentSchema);