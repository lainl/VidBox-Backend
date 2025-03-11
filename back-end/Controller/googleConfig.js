require("dotenv").config();

if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  console.error("GOOGLE_SERVICE_ACCOUNT_KEY is missing from .env file.");
  process.exit(1);
}

const { GoogleAuth } = require("googleapis-common");

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY, "base64").toString("utf8")
);

const auth = new GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const { drive } = require("google-drive-only");
const driveInstance = drive({ version: "v3", auth });


module.exports = { driveInstance, auth };
