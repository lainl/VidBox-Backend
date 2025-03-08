const path = require("path");
const fs = require("fs");
const { expect } = require("chai");
const { uploadVideoToDrive } = require("../Controller/googleCloudStoring");

describe("Google Drive Video Storage", function () {
  this.timeout(60000);

  it("should upload a test video to Google Drive", async () => {
    const videoPath = path.join(__dirname, "vidBoxTestVideo.mp4");
    const fileBuffer = fs.readFileSync(videoPath);

    const mockFile = {
      originalname: "vidBoxTestVideo.mp4",
      buffer: fileBuffer,
      mimetype: "video/mp4",
    };

    let uploadedFile;
    try {
      uploadedFile = await uploadVideoToDrive(mockFile);
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }

    expect(uploadedFile).to.be.an("object");
    expect(uploadedFile).to.have.property("id");
    expect(uploadedFile).to.have.property("webViewLink");
    
  });
});
