const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;


app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(cors());


app.use(require("./Routes/home"));
app.use(require("./Routes/upload"));
app.use(require("./Routes/user"));
app.use(require("./Routes/auth"));


if (require.main === module) {
  app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Express Listening http://localhost:${PORT}/`);
  });
}

module.exports = app;
