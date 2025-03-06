const { MongoClient, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");




const uri = "mongodb+srv://group5:RDh7hFPdeaQnwW49@vidboxdb.6zavw.mongodb.net/VidBoxDB";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connect() {
  if (!db) {
    await client.connect();
    db = client.db("VidBoxDB");
  }
}

/**
 * CREATE: Only username, password, and email needed.
 * @param {string} username 
 * @param {string} password 
 * @param {string} email 
 * @returns {Promise<Object>} returns the user.
 */
async function createUser(username, password, email) {
  await connect();
  const collection = db.collection("User");
  console.log(username + " " + password + " " + email);
  
  const userData = { username, password, email };
  const result = await collection.insertOne(userData);
  const doc = await collection.findOne({ _id: result.insertedId });
  
  doc.createdAt = new Date(); 
  return doc;
}

/**
 * GET: Retrieve a user by their MongoDB _id for developerAPI.
 * @param {string} userId 
 * @returns {Promise<Object|null>} 
 */
async function getUserById(userId) {
   
    await connect();
    const collection = db.collection("User");
  
    const doc = await collection.findOne({ _id: new ObjectId(userId) });
    if (!doc) return null;
    
    doc.fetchedAt = new Date();
    console.log(doc);
    return doc;
  }
  

/**
 * GET: Retrieve a user by their username.
 * @param {string} username 
 * @returns {Promise<Object|null>} 
 */
async function getUserByUsername(username) {
  await connect();
  const collection = db.collection("User");
  const doc = await collection.findOne({ username });
  if (!doc) return null;
  
  doc.fetchedAt = new Date();
  return doc;
}

/**
 * GET: Retrieve a user by their email.
 * @param {string} email 
 * @returns {Promise<Object|null>} 
 */
async function getUserByEmail(email) {
  await connect();
  const collection = db.collection("User");
  const doc = await collection.findOne({ email });
  if (!doc) return null;
  
  doc.fetchedAt = new Date();
  return doc;
}

/**
 * UPDATE: Only the password can be updated
 * @param {string} userId 
 * @param {string} newPassword 
 * @returns {Promise<Object>} A message and the updated user data.
 */
async function updateUserPassword(userId, newPassword) {
  await connect();
  const collection = db.collection("User");
  
  const result = await collection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: newPassword } }
  );
  
  if (result.matchedCount === 0) {
    throw new Error("User not found.");
  }
  
  const doc = await collection.findOne({ _id: new ObjectId(userId) });
  
  doc.updatedAt = new Date();
  return {
    message: "Password updated.",
    user: doc
  };
}

/**
 * DELETE: Delete a user by their _id.
 * @param {string} userId 
 * @returns {Promise<Object>} Delete message.
 */
async function deleteUser(userId) {
  await connect();
  const collection = db.collection("User");
  
  const result = await collection.deleteOne({ _id: new ObjectId(userId) });
  if (result.deletedCount === 0) {
    throw new Error("User not found.");
  }
  
  return { message: "User deleted." };

}

// #region tokenManagement
/**
 * ADD REFRESH TOKEN:
 * Inserts a new refresh token for user authentication.
 * The token expires automatically after 7 days.
 * 
 * @param {string} token - The generated refresh token.
 * @param {string} userId - The associated user’s ID.
 * @returns {Promise<Object>} The saved refresh token document.
 */
async function addRefreshToken(token, userId) {
    await connect(); // Ensure database connection
    const collection = db.collection("refreshTokens");

    const newToken = {
        token,
        userId: new ObjectId(userId), // Convert to ObjectId
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Set expiration for 7 days
    };

    const result = await collection.insertOne(newToken);
    return result;
}

/**
 * REMOVE REFRESH TOKEN:
 * Deletes a refresh token when a user logs out.
 * 
 * @param {string} token - The token to be removed.
 * @returns {Promise<Object>} Deletion result.
 */
async function removeRefreshToken(token) {
    await connect();
    const collection = db.collection("refreshTokens");

    const result = await collection.deleteOne({ token });
    return result;
}

/**
 * FIND REFRESH TOKEN:
 * Retrieves a refresh token from the database.
 * 
 * @param {string} token - The token to search for.
 * @returns {Promise<Object|null>} The found token or null if not found.
 */
async function findRefreshToken(token) {
    await connect();
    const collection = db.collection("refreshTokens");

    const result = await collection.findOne({ token });
    return result;
}

/**
 * BLACKLIST ACCESS TOKEN:
 * Adds an access token to the blacklist collection.
 * The token will automatically expire after 1 hour.
 * 
 * @param {string} token - The access token to be blacklisted.
 * @returns {Promise<Object>} The saved blacklist token document.
 */
async function blacklistAccessToken(token) {
    await connect(); 
    const collection = db.collection("blackListAccessToken");

    if (await isTokenBlacklisted(token)) {
      console.log("Token is already blacklisted:", token);
      return { message: "Token is already blacklisted", token };
  }

    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.exp) {
        throw new Error("Invalid token. Unable to determine expiration.");
    }

    const expiresAt = new Date(decodedToken.exp * 1000);

    const blacklistedToken = {
        token,
        expiresAt
    };

    const result = await collection.insertOne(blacklistedToken);
    return {
      message: "Token successfully blacklisted",
      insertedId: result.insertedId,
      token
  };
}




/**
 * @param {string} token 
 * @returns boolean checking if the  access token is in the database or not
 */
async function isTokenBlacklisted(token) {
  await connect();
  const collection = db.collection("blackListAccessToken");

  const blacklistedEntry = await collection.findOne({ token });
  return blacklistedEntry !== null; 
}
// #endregion tokenManagement

//# region videoManagement
async function addVideo(file, { videoID, title, googleDriveLink, postTime, userID }) {
  await connect();
  const collection = db.collection("Video");
  const userCollection = db.collection("User");

  const user = await getUserById(userID);
  if (!user) {
    throw new Error("User not found. Cannot add video.");
  }

  const docToInsert = {
    videoID,
    title,
    googleDriveLink,
    postTime,
    userID,
    fieldname: file.fieldname,
    originalname: file.originalname,
    encoding: file.encoding,
    mimeType: file.mimetype,
    size: file.size
  };
  
  const result = await collection.insertOne(docToInsert);
  const doc = await collection.findOne({ _id: result.insertedId });


  await userCollection.updateOne(
    { _id: new ObjectId(userID) },
    { $push: { videoIds: doc._id } } 
  );

  return doc;
}
/**
 * Deletes a video by its ID and removes that ID from the user's videoIds array.
 * @param {string} videoId - The ID of the video to delete
 * @param {string} userId - The ID of the user who owns the video
 * @returns {Promise<{ message: string }>}
 */
async function deleteVideoById(videoId, userId) {
  await connect();

  const videoCollection = db.collection("Video");
  const userCollection = db.collection("User");

  const user = await getUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const result = await videoCollection.deleteOne({ _id: new ObjectId(videoId) });
  if (result.deletedCount === 0) {
    throw new Error("Video not found.");
  }
  
  await userCollection.updateOne(
    { _id: user._id },
    { $pull: { videoIds: new ObjectId(videoId) } }
  );

  return { message: "Video deleted." };
}

async function updateVideoTitleById(videoId, newTitle) {
  await connect();
  const collection = db.collection("Video");
  const result = await collection.updateOne(
    { _id: new ObjectId(videoId) },
    { $set: { title: newTitle } }
  );
  if (result.matchedCount === 0) {
    throw new Error("Video not found.");
  }
  const doc = await collection.findOne({ _id: new ObjectId(videoId) });
  return doc;
}
async function findVideoById(videoId) {
  await connect();
  const collection = db.collection("Video");
  const doc = await collection.findOne({ _id: new ObjectId(videoId) });
  return doc;
}
//# endregion videoManagement


module.exports = {
    connect,
    createUser,
    getUserById,
    getUserByEmail, 
    deleteUser,
    getUserByUsername,
    addRefreshToken,
    removeRefreshToken,
    findRefreshToken,
    blacklistAccessToken,
    isTokenBlacklisted,
    addVideo,
    deleteVideoById,
    updateVideoTitleById,
    findVideoById,
  };