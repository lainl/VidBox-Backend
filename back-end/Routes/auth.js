const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { addRefreshToken, findRefreshToken, removeRefreshToken, blacklistAccessToken, isTokenBlacklisted, getUserByUsername } = require("../Controller/mongoDB");

router.use(cookieParser());


router.post("/login", async (req, res) => {
  try {
    const username = req.body.username?.trim() || "";
    const password = req.body.password?.trim() || "";


    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const user = await getUserByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const accessToken = jwt.sign(
      { userId: user._id, username: user.username },
      "vid_box_session_secret_key_very_hard_to_guess",
      { expiresIn: "1h" }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    await addRefreshToken(refreshToken, user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const userid = user._id;
    return res.json({
      message: `Welcome, you are logged in as ${user.username}!`,
      accessToken,
      refreshToken,
      userid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken?.trim();

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required." });
    }

    const storedToken = await findRefreshToken(refreshToken);

    if (!storedToken) {
      return res.status(403).json({ error: "Invalid refresh token." });
    }

    if (new Date() > new Date(storedToken.expirationDate)) {
      return res.status(403).json({ error: "Refresh token expired. Please log in again." });
    }

    const newAccessToken = jwt.sign(
      { userId: storedToken.userId },
      "vid_box_session_secret_key_very_hard_to_guess",
      { expiresIn: "1h" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/testAuthPage", authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.username}. This is a protected route.` });
});


router.post("/logout", async (req, res) => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken?.trim();

    if (!refreshToken || !accessToken) {
      return res.status(400).json({ error: "Access token and refresh token needed to logout." });
    }

    const result = await removeRefreshToken(refreshToken);

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: "Invalid refresh token." });
    }

    await blacklistAccessToken(accessToken);

    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });

    res.json({ message: "Logged out successfully, access token revoked." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const user = jwt.verify(token, "vid_box_session_secret_key_very_hard_to_guess");

    if (await isTokenBlacklisted(token)) {
      console.log("Token is blacklisted:", token);
      return res.status(403).json({ error: "Token revoked. Please log in again." });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authenticateToken error:", err);
    return res.status(401).json({ error: "Token expired or invalid. Please refresh token." });
  }
}

module.exports = router;
