const { google } = require("googleapis");
require("dotenv").config();

/**
 * Google Auth Object
 * @type {google.auth.GoogleAuth}
 */

if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  console.error(" GOOGLE_SERVICE_ACCOUNT_KEY is missing from .env file.");
  process.exit(1);
}


const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, "base64").toString("utf8")
);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

module.exports = { auth, credentials };
