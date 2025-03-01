const { google } = require("googleapis");
const { Readable } = require("stream"); // Import Readable to create a stream
const { auth } = require("../config/googleConfig");

const drive = google.drive({ version: "v3", auth });

/**
 * Converts a Buffer to a Readable Stream
 * Necessary because the Google Drive API requires a stream for file uploads.
 * @param {Buffer} buffer
 * @returns {Readable}
 */
function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}


/**
 * Uploads a video file to Google Drive
 * @param {Object} file - Multer file object (buffer, mimetype, originalname)
 * @returns {Promise<{ id: string, webViewLink: string }>} - Uploaded file info will CHANGE later
 */
async function uploadVideoToDrive(file) {
  if (!file) throw new Error("No file provided!");

  const folderId = "1gngwPGYEZPMbTHz_1U24LIdZAxtwMhXq"; 

  const fileMetadata = {
    name: file.originalname,
    parents: [folderId], 
  };

  const media = {
    mimeType: file.mimetype,
    body: bufferToStream(file.buffer), 
  };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    console.log(" File uploaded:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
} 


/**
 * Deletes video from google drive
 * @param {string} fileLink - The Google Drive file link
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function removeFileFromDrive(fileLink) {
  const fileId = extractFileId(fileLink);
  if (!fileId) {
    throw new Error("Invalid Google Drive link.");
  }

  try {
    await drive.files.delete({ fileId });
    return { success: true, message: "File deleted successfully" };
  } catch (error) {
    console.error("Delete error:", error.message);
    throw new Error("Failed to delete file: " + error.message);
  }}


module.exports = { uploadVideoToDrive };
