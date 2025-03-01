const express = require("express");
const router = express.Router();
const { createUser, getUserById, deleteUser, getUserByUsername } = require("../Controller/mongoDB");


router.get("/user/:id", async (req, res) => {
  const cleanId = req.params.id.trim();
  try {
    const user = await getUserById(cleanId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/user", async (req, res) => {
  try {
    const username = req.body.username?.trim() || "";
    const password = req.body.password?.trim() || "";
    const email = req.body.email?.trim() || "";
    const user = await createUser(username, password, email);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete("/user/:id", async (req, res) => {
  const cleanId = req.params.id.trim();
  try {
    const result = await deleteUser(cleanId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/user/username/:username", async (req, res) => {
  const cleanUsername = req.params.username.trim();
  try {
    const user = await getUserByUsername(cleanUsername);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
