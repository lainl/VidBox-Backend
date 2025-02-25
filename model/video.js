class Video {
    constructor(title, postDate, googleUploadLink, uploaderID) {
      this.title = title;
      this.postDate = postDate;
      this.googleUploadLink = googleUploadLink;
      this.uploaderID = uploaderID;
    }
  
    toString() {
      return `Video: { Title: ${this.title}, Post Date: ${this.postDate}, Google Upload Link: ${this.googleUploadLink}, UploaderID: ${this.uploaderID}}`;
    }
  }
  
  module.exports = Video;