class Video {
    constructor(title, postDate, googleUploadLink, uploaderID, size, mimeType, duration) {
      this.title = title;
      this.postDate = postDate;
      this.googleUploadLink = googleUploadLink;
      this.size = size;
      this.mimeType =  mimeType
      this.uploaderID = uploaderID;
      this.duration = duration;
    }
  
    toString() {
      return `Video - Title: ${this.title}, Post Date: ${this.postDate}, Google Upload Link: ${this.googleUploadLink}, Uploader ID: ${this.uploaderID}, Size: ${this.size} bytes, MIME Type: ${this.mimeType}, Duration: ${this.duration ? this.duration + ' seconds' : 'N/A'}`;
    }
    
  }
  
  module.exports = Video;