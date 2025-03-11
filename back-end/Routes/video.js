const express = require("express");
const router = express.Router();
const {
  uploadVideo,
  videoUpdateTitle,
  videoDelete,
  videoFindById
} = require("../Controller/videoStorageMiddleware");
const { streamVideoFromDrive } = require("../Controller/googleCloudStoring");


router.post("/video/upload", uploadVideo);

router.patch("/video/:videoId", videoUpdateTitle);

router.delete("/video/:videoId", videoDelete);

router.get("/video/:videoId", videoFindById);

router.get("/video/stream/:videoId", streamVideoFromDrive);

module.exports = router;
