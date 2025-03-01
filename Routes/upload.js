const express = require("express");
const router = express.Router();
const vidoeStorageMiddleware = require("../Controller/videoStorageMiddleware");

router.post("/upload", vidoeStorageMiddleware, (req, res) => {
  res.json(req.file);
});

module.exports = router;
