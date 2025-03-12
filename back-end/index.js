const express = require("express");

const { createUser, getUserById, deleteUser, getUserByUsername, addRefreshToken, removeRefreshToken, findRefreshToken, blacklistAccessToken } = require('./services/mongoDB'); 
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const multer = require("multer");
const upload = multer();



const PORT = 3000;

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());


app.use(require("./Routes/home"));
app.use(require("./Routes/video"));
app.use(require("./Routes/user"));
app.use(require("./Routes/auth"));
app.use(require("./Routes/profile"));


app.get('/testAuthPage', authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.username}. This is a protected route.` });
});


// #region userAPI

app.get('/user/:id', async (req, res) => {
    const cleanId = req.params.id.trim();
  
    try {
      const user = await getUserById(cleanId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}); 

app.post('/user', async (req, res) => {
    try {
      const username = req.body.username?.trim() || '';
      const password = req.body.password?.trim() || '';
      const email = req.body.email?.trim() || '';

      const user = await createUser(username, password, email);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.delete('/user/:id', async (req, res) => {
    const cleanId = req.params.id.trim();

    try {
      const result = await deleteUser(cleanId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.get('/user/username/:username', async (req, res) => {
    const cleanUsername = req.params.username.trim();

    try {
        const user = await getUserByUsername(cleanUsername);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// #endregion userAPI


// #region authAPI
/**
 * login - send a json object with username and password
 * checks if fields are empty, verifies user existence and password,
 * and if valid, returns a welcome message along with:
 *   - accessToken (JWT, expires in 1h)
 *   - refreshToken (stored in MongoDB, valid for 7 days)
 */
app.post('/login', async (req, res) => {
    try {
      const username = req.body.username?.trim() || '';
      const password = req.body.password?.trim() || '';
  
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
  
      const user = await getUserByUsername(username);
  
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
  
      const accessToken = jwt.sign(
          { userId: user._id, username: user.username },
          "vid_box_session_secret_key_very_hard_to_guess",
          { expiresIn: '1h' }
      );
  
      const refreshToken = crypto.randomBytes(40).toString('hex');
      
      await addRefreshToken(refreshToken, user._id);
      
      
      res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: true,  
          sameSite: 'Strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
  
      return res.json({
          message: `Welcome, you are logged in as ${user.username}!`,
          accessToken,
          refreshToken
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

/**
 * refresh-token - uses the refresh token (from cookie or request body) to issue a new access token.
 */
app.post('/refresh-token', async (req, res) => {
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
            { expiresIn: '1h' }
        );
  
        res.json({ accessToken: newAccessToken });
  
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    jwt.verify(token, "vid_box_session_secret_key_very_hard_to_guess", (err, user) => {
        if (err) return res.status(401).json({ error: 'Token expired. Please refresh token.' });
        req.user = user;
        next();
    });
}

/**
 * logout - send a json object with refreshToken.
 * Removes the provided refresh token from the database,
 * blacklists the access token, and logs out of that session.
 */
app.post('/logout', async (req, res) => {

    //TODO: Fix handling tokens not being blacklisted, most likely accessing db wrong
    try {
        const accessToken = req.headers['authorization']?.split(' ')[1]; 
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken?.trim();

        if (!refreshToken || !accessToken) {
            return res.status(400).json({ error: 'Access token and refresh token needed to logout.' });
        }

        const result = await removeRefreshToken(refreshToken);

        if (result.deletedCount === 0) {
            return res.status(400).json({ error: 'Invalid refresh token.' });
        }

        await blacklistAccessToken(accessToken);

        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'Strict' });

        res.json({ message: 'Logged out successfully, access token revoked.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

  // #endregion authAPI

  if (require.main === module) {
app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Express Listening http://localhost:${PORT}/`);
})
  } //server only starts when the file is run directly so no conflicts during testing

  module.exports = app;
