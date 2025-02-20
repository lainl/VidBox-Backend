const { MongoClient, ObjectId } = require('mongodb');


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

module.exports = {
    connect,
    createUser,
    getUserById, 
    deleteUser,
    getUserByUsername,
  };