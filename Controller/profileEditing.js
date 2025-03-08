const multer = require("multer");
const { addProfilePicToDrive, removeFileFromDrive, getProfilePicFromDrive } = require("./googleCloudStoring");
const { getUserById, updateUser } = require("./mongoDB");

const upload = multer();
async function uploadProfilePicture(req, res) {
    upload.single("file")(req, res, async function (err) {
      if (err) {
        console.error("Error processing file:", err);
        return res.status(400).json({ error: "Error processing file" });
      }
      try {
        const { userId } = req.body;
        if (!userId || !req.file) {
          return res.status(400).json({ error: "User ID and file are required" });
        }
        let user = await getUserById(userId);
        if (!user) {
          throw new Error("User not found");
        }
        if (user.profilePicture) {
          await removeFileFromDrive(user.profilePicture);
        }
        const driveResponse = await addProfilePicToDrive(req.file);
        const profilePicUrl = driveResponse.webViewLink;
        const updatedUser = await updateUser(userId, { profilePicture: profilePicUrl });
        console.log("Profile picture updated successfully.");
        res.json({
          success: true,
          message: "Profile picture updated",
          profilePicUrl,
          user: updatedUser
        });
      } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    });
}

async function updateBio(req, res) {
    try {
        const { userId, bio } = req.body;
        if (!userId || !bio) {
            return res.status(400).json({ error: "User ID and bio are required" });
        }

        let user = await getUserById(userId);
        if (!user) throw new Error("User not found");

        const updatedUser = await updateUser(userId, { bio });

        res.json({ success: true, message: "Bio updated", updatedBio: updatedUser.bio });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getProfilePicture(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const user = await getUserById(userId);
      if (!user || !user.profilePicture) {
        return res.status(404).json({ error: "Profile picture not found" });
      }
      const { stream, mimeType } = await getProfilePicFromDrive(user.profilePicture);
      res.setHeader("Content-Type", mimeType);
      stream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}
  

module.exports = { uploadProfilePicture, updateBio, getProfilePicture };
