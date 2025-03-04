<<<<<<< Updated upstream
export default class video{
    constructor( title, postDate, googleUploadLink, uploaderID){
        this.title = title;
        this.postDate = postDate;
        this.googleUploadLink = googleUploadLink;
        this.uploaderID = uploaderID;
=======
const { default: mongoose } = require("mongoose");

class Video {
    constructor(videoID, title, postDate, googleDriveLink, userID) {
      this.videoID = videoID;
      this.title = title;
      this.postDate = postDate;
      this.googleDriveLink = googleDriveLink;
      this.userID = userID;
>>>>>>> Stashed changes
    }

    toString() {
<<<<<<< Updated upstream
        return `Video: { title: ${this.title}, postDate: ${this.postDate}, googleUploadLink: ${this.googleUploadLink}, uploaderID: ${this.uploaderID} }`;
      }
}
=======
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
>>>>>>> Stashed changes
