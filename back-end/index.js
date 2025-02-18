const express = require("express");

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

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Express Listening http://localhost:${PORT}/`);
})