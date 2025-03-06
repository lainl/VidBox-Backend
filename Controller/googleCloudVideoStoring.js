const { google } = require("googleapis");
const { Readable } = require("stream");
const { auth } = require("./googleConfig");
const { findVideoById } = require('./mongoDB');
const drive = google.drive({ version: "v3", auth });

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

async function uploadVideoToDrive(file) {
  if (!file) throw new Error("No file provided!");
  const folderId = "1gngwPGYEZPMbTHz_1U24LIdZAxtwMhXq";
  const fileMetadata = { name: file.originalname, parents: [folderId] };
  const media = { mimeType: file.mimetype, body: bufferToStream(file.buffer) };

  try {
    const response = await drive.files.create({
      resource: fileMetadata,
      media,
      fields: "id, webViewLink"
    });
    return response.data;
  } catch (error) {
    console.error("Upload error:", error.message);
    throw error;
  }
}



async function streamVideoFromDrive(req, res) {
  try {
    // 1) Get the video ID from the URL params
    const { videoId } = req.params;
    console.log("[streamVideoFromDrive] Received video ID:", videoId);

    // 2) Find the video doc in MongoDB
    const videoDoc = await findVideoById(videoId);
    console.log("[streamVideoFromDrive] Retrieved videoDoc from DB:", videoDoc);

    if (!videoDoc) {
      console.error("[streamVideoFromDrive] Video not found in DB");
      return res.status(404).json({ error: "Video not found in DB" });
    }

    // 3) Extract the googleDriveLink from the video document
    const googleDriveLink = videoDoc.googleDriveLink;
    console.log("[streamVideoFromDrive] Found googleDriveLink:", googleDriveLink);

    // 4) Extract the file ID from the link
    const fileId = extractFileId(googleDriveLink);
    console.log("[streamVideoFromDrive] Extracted file ID:", fileId);

    if (!fileId) {
      console.error("[streamVideoFromDrive] Invalid Google Drive link format");
      return res.status(400).json({ error: "Invalid Google Drive link format" });
    }

    // 5) Fetch file metadata (name, mimeType) from Google Drive
    console.log("[streamVideoFromDrive] Requesting file metadata from Google Drive...");
    const meta = await drive.files.get({ fileId, fields: "id, name, mimeType" });
    console.log("[streamVideoFromDrive] File metadata response:", meta.data);

    if (!meta.data) {
      console.error("[streamVideoFromDrive] File metadata is empty or undefined");
      return res.status(404).json({ error: "File not found in Google Drive" });
    }

    // Use the returned mimeType if available, otherwise default to 'video/mp4'
    const mimeType = meta.data.mimeType || "video/mp4";
    console.log("[streamVideoFromDrive] Using mimeType:", mimeType);

    // 6) Get a readable stream of the file content
    console.log("[streamVideoFromDrive] Requesting file stream from Google Drive...");
    const driveStream = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    console.log("[streamVideoFromDrive] Google Drive stream retrieved successfully.");

    // 7) Set headers for the response
    // NOTE: This approach does NOT handle partial content (Range requests).
    // Some browsers may require 206 partial content for large files.
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Accept-Ranges", "bytes");

    console.log("[streamVideoFromDrive] Sending stream to client...");
    console.warn("[streamVideoFromDrive] WARNING: No partial content handling. Large files may fail on some browsers.");

    // 8) Pipe the data to the response
    // Attach extra debug for chunk sizes
    let totalBytes = 0;
    driveStream.data
      .on("data", (chunk) => {
        totalBytes += chunk.length;
        console.log(`[streamVideoFromDrive] Received chunk of size: ${chunk.length} bytes (total so far: ${totalBytes})`);
      })
      .on("error", (streamErr) => {
        console.error("[streamVideoFromDrive] Error reading stream from Drive:", streamErr.message);
        return res.status(500).json({ error: "Error reading stream from Drive" });
      })
      .on("end", () => {
        console.log(`[streamVideoFromDrive] Stream ended. Total bytes sent: ${totalBytes}`);
      })
      .pipe(res);

    console.log("[streamVideoFromDrive] Stream piping in progress...");
  } catch (err) {
    console.error("[streamVideoFromDrive] Error streaming video from Drive:", err.message);
    return res.status(500).json({ error: "Failed to stream video" });
  }
}



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
  }
}


function extractFileId(googleDriveLink) {
  const match = googleDriveLink.match(/\/d\/(.*?)(\/|$)/);
  return match ? match[1] : null;
}

module.exports = {
  uploadVideoToDrive,
  streamVideoFromDrive,
  removeFileFromDrive
};
