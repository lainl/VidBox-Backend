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

## 📡 Interacting with MongoDB: User Schema  

| Method  | Endpoint                     | Description |
|---------|------------------------------|-------------|
| **GET**  | `/user/:id`                  | Fetch user by ID, returns user details or `404`. |
| **POST** | `/user`                      | Create a new user, sends `{ username, password, email }`, returns created user. |
| **DELETE** | `/user/:id`               | Delete user by ID, returns deletion confirmation. |
| **GET**  | `/user/username/:username`   | Fetch user by username, returns user details or `404`. |
