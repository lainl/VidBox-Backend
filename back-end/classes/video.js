class Video {
    constructor(videoID, title, postDate, googleDriveLink, userID) {
      this.videoID = videoID;
      this.title = title;
      this.postDate = postDate;
      this.googleDriveLink = googleDriveLink;
      this.userID = userID;
    }
  
    toString() {
      return `User: { Title: ${this.title}, Post Date: ${this.postDate}, Google Upload Link: ${this.googleDriveLink}, UploaderID: ${this.userID}}`;
    }
  }
  
  module.exports = Video;