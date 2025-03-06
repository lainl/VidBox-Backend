## VidBox Backend  

You can see who contributed to the first commit in the **AB_Back-end** branch:  
🔗 [GitHub Branch - AB_Back-end](https://github.com/lainl/VidBox-Backend/tree/AB_Back-end)  

---

## 🚀 Features  
- 🔒 **Secure Authentication** – Uses **jsonwebtoken (JWT)** for user authentication.  
- ☁ **Cloud Storage** – Integrates **Google Cloud Storage** for video file storage.  
- 🛢 **Database** – Uses **MongoDB** to manage user and video data.  
- 🔄 **RESTful API** – Provides endpoints for interacting with the **User schema** in MongoDB.  

---

## 📡 General API  

| Method  | Endpoint                     | Description |
|---------|------------------------------|-------------|
| **GET**  | `/user/:id`                  | Fetch user by ID, returns **{ _id, username, email, videoIds }** or `404`. |
| **POST** | `/user`                      | Create a new user, sends **{ username, password, email }**, returns **{ _id, username, email }**. |
| **DELETE** | `/user/:id`               | Delete user by ID, returns **{ message: "User deleted." }**. |
| **GET**  | `/user/username/:username`   | Fetch user by username, returns **{ _id, username, email, videoIds }** or `404`. |
| **POST** | `/login`                     | Authenticates user, sends **{ username, password }**, returns **{ accessToken, refreshToken, message, userid }**. |
| **POST** | `/logout`                    | Logs out user by invalidating the **refresh token**, sends **{ accessToken, refreshToken }**, returns **{ message: "Logged out." }**. |
| **POST** | `/video/upload` | Uploads a video, sends **{ video file, userId, (optional) title }**, returns **{ message, filename, mimetype, size }**. **File size limit:** 10MB. |
| **GET**  | `/video/:videoId`            | gets video metadata by ID, returns **{ _id, title, googleDriveLink, userID, postTime }** or `404`. |
| **DELETE** | `/video/:videoId` | Deletes a video, sends **{ videoId, userId, driveLink}**, removes from database and Google Drive, returns **{ message: "Video deleted." }** or an error. |
| **GET**  | `/video/stream/:videoId`         | Streams video from Google Drive, sends **{ videoId }**, returns video stream or `404`. |
| **PATCH**  | `/video/:videoId`                | Updates a video’s title. Expects **{ newTitle }** in request body. |
---
