const path = require('path');
const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../index');

const testUserId = "67b67a0fb4a8e0eedd1aa497";
const testImagePath = path.join(__dirname, "CanofBeans.png");

describe("Profile Editing API", function() {
  describe("Profile Picture", function() {
    let initialProfilePicUrl;

    it("should add a new profile picture if not present", function(done) {
        this.timeout(10000);
      request(app)
        .post("/profile/picture")
        .field("userId", testUserId)
        .attach("file", testImagePath)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property("success", true);
          expect(res.body).to.have.property("profilePicUrl").that.is.a("string");
          initialProfilePicUrl = res.body.profilePicUrl;
          done();
        });
    });

    it("should update the profile picture if already present", function(done) {
        this.timeout(10000);
      request(app)
        .post("/profile/picture")
        .field("userId", testUserId)
        .attach("file", testImagePath)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property("success", true);
          expect(res.body).to.have.property("profilePicUrl").that.is.a("string");
          expect(res.body.profilePicUrl).to.not.equal(initialProfilePicUrl);
          done();
        });
    });
  });

  describe("Bio", function() {
    let initialBio;
    const bioAdd = "I have a deep passion for beans; they are versatile, nutritious, and fuel my creativity.";
    const bioUpdate = "My love for beans is ever-growing, inspiring every aspect of my life.";

    it("should add a new bio if not present", function(done) {
      request(app)
        .post("/profile/bio")
        .send({ userId: testUserId, bio: bioAdd })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property("success", true);
          expect(res.body).to.have.property("updatedBio", bioAdd);
          initialBio = res.body.updatedBio;
          done();
        });
    });

    it("should update the bio if already present", function(done) {
      request(app)
        .post("/profile/bio")
        .send({ userId: testUserId, bio: bioUpdate })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property("success", true);
          expect(res.body).to.have.property("updatedBio", bioUpdate);
          expect(res.body.updatedBio).to.not.equal(initialBio);
          done();
        });
    });
  });
});
