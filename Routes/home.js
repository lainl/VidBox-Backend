const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("/ hit");
  const responseJson = {
    message: "Welcome to VidBox",
    routes: [
      {
        route: "/",
        details: "Home route"
      },
      {
        route: "/login",
        details: "prompt login/signup"
      }
    ]
  };

  res.json(responseJson);
});

module.exports = router;
