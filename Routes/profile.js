const express = require("express");
const router = express.Router();
const { uploadProfilePicture, updateBio } = require("../Controller/profileEditing");

router.post("/profile/picture", uploadProfilePicture);
router.post("/profile/bio", updateBio);

module.exports = router;
