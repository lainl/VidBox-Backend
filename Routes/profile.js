const express = require("express");
const router = express.Router();
const { uploadProfilePicture, updateBio, getProfilePicture } = require("../Controller/profileEditing");

router.post("/profile/picture", uploadProfilePicture);
router.post("/profile/bio", updateBio);
router.get("/profile/picture/:userId", getProfilePicture);

module.exports = router;
