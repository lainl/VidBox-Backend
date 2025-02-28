const path = require('path');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index'); 

describe('Video Upload Middleware Tests', function () {
  
  it('should upload a valid video and return the correct metadata', function (done) {
    request(app)
      .post('/upload')
      .attach('video', path.join(__dirname, 'vidBoxTestVideo.mp4'))
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        console.log('✅ Response JSON (Valid Upload):', JSON.stringify(res.body, null, 2));
        expect(res.body).to.have.property('filename', 'vidBoxTestVideo.mp4');
        expect(res.body).to.have.property('title', 'vidBoxTestVideo.mp4');
        expect(res.body).to.have.property('mimetype').that.contains('video');
        expect(res.body).to.not.have.property('size'); 
        done();
      });
  });

  it('should reject files larger than the allowed limit', function (done) {
    request(app)
      .post('/upload')
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
    request(app)
      .post('/upload')
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
    request(app)
      .post('/upload')
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

//mainly chatgpt generated
