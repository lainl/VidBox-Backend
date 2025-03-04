const express = require("express");
const router = express.Router();
const videoUpload = require("../Controller/videoStorageMiddleware");

router.post("/upload", videoUpload, (req, res) => {
  res.json(req.file);
});

module.exports = router;
