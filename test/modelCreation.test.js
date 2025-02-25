const { expect } = require('chai');
const User = require('../model/user');
const Video = require('../model/video');

describe('Model Tests', function () {
    it('should create a User instance and print it', function () {
        const user = new User('test@example.com', 'testUser', 'securePassword');
        
        console.log(user.toString());

        expect(user).to.be.an.instanceOf(User);
        expect(user.email).to.equal('test@example.com');
        expect(user.username).to.equal('testUser');
        expect(user.password).to.equal('securePassword');
    });

    it('should create a Video instance and print it', function () {
        const video = new Video('Test Video', '2025-02-25', 'https://google.com/upload', 'user123');

        console.log(video.toString());

        expect(video).to.be.an.instanceOf(Video);
        expect(video.title).to.equal('Test Video');
        expect(video.postDate).to.equal('2025-02-25');
        expect(video.googleUploadLink).to.equal('https://google.com/upload');
        expect(video.uploaderID).to.equal('user123');
    });
});
