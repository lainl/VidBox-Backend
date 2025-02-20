const express = require("express");
const { createUser, getUserById, deleteUser, getUserByUsername} = require('./services/mongoDB'); 

const PORT = 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req, res) => {
    console.log("/ hit");

    var responseJson = {
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
})


// USER API
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


  
  // END OF USER API
  



app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Express Listening http://localhost:${PORT}/`);
})