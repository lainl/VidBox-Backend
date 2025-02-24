export default class video{
    constructor( title, postDate, googleUploadLink, uploaderID){
        this.title = title;
        this.postDate = postDate;
        this.googleUploadLink = googleUploadLink;
        this.uploaderID = uploaderID;
    }

    toString() {
        return `Video: { title: ${this.title}, postDate: ${this.postDate}, googleUploadLink: ${this.googleUploadLink}, uploaderID: ${this.uploaderID} }`;
      }
}