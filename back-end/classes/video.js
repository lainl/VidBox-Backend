const { default: mongoose } = require("mongoose");

class Video {
    constructor(videoID, title, postDate, googleDriveLink, userID) {
      this.videoID = videoID;
      this.title = title;
      this.postDate = postDate;
      this.googleDriveLink = googleDriveLink;
      this.userID = userID;
    }

    toString() {
      return `Video: { Title: ${this.title}, Post Date: ${this.postDate}, Google Upload Link: ${this.googleDriveLink}, UploaderID: ${this.userID}}`;
    }
  }
  
  const VideoSchema = new mongoose.Schema({
    videoId: {
      type: int,
      index: { unique: true }
    },
    title: string,
    postDate: string,
    googleDriveLink: string,
    userId: {
      type: int,
      index: {unique: true}
    }
  })

  module.exports = mongoose.model(Video, VideoSchema);
