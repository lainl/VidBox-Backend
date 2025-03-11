const path = require('path');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index');

describe('Video Endpoints Tests', function () {
  // Extend default Mocha timeout for all tests in this block
  this.timeout(20000);

  describe('POST /video/upload', function () {
    // Extend timeout specifically for uploads
    this.timeout(20000);

    it('should upload a valid video and return correct metadata', function (done) {
      this.timeout(20000);
    
      request(app)
        .post('/video/upload')
        // Add the userId field here
        .field('userId', '64f123456789abcdef012345') // or a real user ID from your DB
        .attach('video', path.join(__dirname, 'vidBoxTestVideo.mp4'))
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          console.log('✅ Response JSON (Valid Upload):', JSON.stringify(res.body, null, 2));
          expect(res.body).to.have.property('message', 'Video uploaded and added to DB successfully');
          expect(res.body.videoRecord).to.have.property('title', 'vidBoxTestVideo.mp4');
          done();
        });
    });
    

    it('should reject files larger than the allowed limit', function (done) {
      this.timeout(20000);

      request(app)
        .post('/video/upload')
        .attach('video', path.join(__dirname, 'ThisVideoIsTooLarge.mp4'))
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (File Too Large):', JSON.stringify(res.body, null, 2));
          expect(res.body).to.have.property('error', 'File size exceeds 10MB limit');
          done();
        });
    });

    it('should reject non-video files', function (done) {
      this.timeout(20000);

      request(app)
        .post('/video/upload')
        .attach('video', path.join(__dirname, 'invalidFile.txt'))
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (Invalid File Type):', JSON.stringify(res.body, null, 2));
          expect(res.body).to.have.property('error', 'Only video files are allowed!');
          done();
        });
    });

    it('should reject an empty request without a file', function (done) {
      this.timeout(20000);

      request(app)
        .post('/video/upload')
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (No File Uploaded):', JSON.stringify(res.body, null, 2));
          expect(res.body).to.have.property('error', 'No video file uploaded');
          done();
        });
    });
  });

  describe('GET /video/:videoId', function () {
    this.timeout(20000);

    it('should fetch video metadata by ID or return 404 if not found', function (done) {
      this.timeout(20000);

      const fakeVideoId = '64f123456789abcdef012345'; // Example or real ID
      request(app)
        .get(`/video/${fakeVideoId}`)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (GET /video/:videoId):', JSON.stringify(res.body, null, 2));
          if (res.status === 404) {
            expect(res.body).to.have.property('error');
          } else {
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('title');
          }
          done();
        });
    });
  });

  describe('DELETE /video/:videoId', function () {
    this.timeout(20000);

    it('should delete a video with { videoId, userId, driveLink }', function (done) {
      this.timeout(20000);

      const bodyData = {
        videoId: '64f123456789abcdef012345',
        userId: '64e987654321abcffed01234',
        driveLink: 'https://drive.google.com/file/d/fakeDriveId12345'
      };
      request(app)
        .delete(`/video/${bodyData.videoId}`)
        .send(bodyData)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (DELETE /video/:videoId):', JSON.stringify(res.body, null, 2));
          if (res.status === 200) {
            expect(res.body).to.have.property('message', 'Video deleted.');
          } else {
            expect(res.body).to.have.property('error');
          }
          done();
        });
    });
  });

  describe('GET /video/stream', function () {
    this.timeout(20000);

    it('should stream a video from Google Drive or return 404 if not found', function (done) {
      this.timeout(20000);

      const googleDriveLink = 'https://drive.google.com/file/d/fakeDriveId999/view';
      request(app)
        .get(`/video/stream?googleDriveLink=${encodeURIComponent(googleDriveLink)}`)
        .expect('Content-Type', /video|json/)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response (GET /video/stream): status =', res.status);
          done();
        });
    });
  });

  describe('PATCH /video/updateTitle', function () {
    this.timeout(20000);

    it('should update a video’s title with { videoId, newTitle }', function (done) {
      this.timeout(20000);

      const bodyData = {
        videoId: '64f123456789abcdef012345',
        newTitle: 'Updated Title'
      };
      request(app)
        .patch('/video/updateTitle')
        .send(bodyData)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) return done(err);
          console.log('Response JSON (PATCH /video/updateTitle):', JSON.stringify(res.body, null, 2));
          if (res.status === 200) {
            expect(res.body).to.have.property('message', 'Video title updated successfully');
            expect(res.body.updatedVideo).to.have.property('title', 'Updated Title');
          } else {
            expect(res.body).to.have.property('error');
          }
          done();
        });
    });
  });
});

//mainly chatgpt generated
