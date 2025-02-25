const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

/**
 * Google Auth Object
 * @type {google.auth.GoogleAuth}
 * 
 *
 */

const serviceAccountPath = path.join(__dirname, "../config/googleServiceAccount.json");


if (!fs.existsSync(serviceAccountPath)) {
  console.error("Service Account JSON file is missing.");
  process.exit(1);
}


const credentials = JSON.parse(fs.readFileSync(serviceAccountPath));


const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

module.exports = { auth };
