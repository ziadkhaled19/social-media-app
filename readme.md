# 🌐 Social Media REST API

A robust and scalable REST API for a social media platform, built with Node.js, Express.js, and MongoDB. This API provides comprehensive functionality for user management, post creation, social interactions, and friend connections.

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication system
- Secure password hashing with bcrypt
- Email-based password reset functionality
- Protected routes with authentication middleware
- Enhanced security headers using Helmet

### 👤 User Management
- User registration and login
- Profile management with photo uploads
- Friend system with request and acceptance workflows
- Email notifications for friend requests
- User search and profile viewing

### 📝 Post Management
- Create, read, update, and delete posts
- Image upload with automatic resizing
- Like/unlike functionality
- Comment system with nested user data
- Personalized news feed based on friends
- User's personal post timeline

### 🖼️ File Handling
- Image upload with Multer
- Image processing using Sharp for automatic resizing
- Optimized file storage system

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Email Service**: Nodemailer
- **Security**: Helmet, bcryptjs
- **Validation**: Validator.js
- **Development**: Nodemon, Morgan (logging)

## 📁 Project Structure

```
social-media-api/
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── postController.js      # Post management
│   ├── userController.js      # User operations
│   └── errorController.js     # Error handling middleware
├── models/
│   ├── userModel.js          # User schema
│   └── postModel.js          # Post schema
├── routes/
│   ├── userRoutes.js         # User endpoints
│   └── postRoutes.js         # Post endpoints
├── utils/
│   ├── AppError.js           # Custom error class
│   ├── catchAsync.js         # Async error wrapper
│   └── Email.js              # Email service
├── imgs/                     # Image storage
├── app.js                    # Express app configuration
└── server.js                 # Server startup
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/social-media-api.git
   cd social-media-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90
   
   # Email Configuration
   HOST=your_email_host
   EPORT=your_email_port
   USERNAME=your_email_username
   PASSWORD=your_email_password
   ```

4. **Create required directories**
   ```bash
   mkdir -p imgs/posts imgs/profilePicture
   ```

5. **Start the application**
   ```bash
   # Development
   npm start
   
   # Production
   npm run start:prod
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - Register new user
- `GET /api/v1/users/login` - User login
- `PATCH /api/v1/users/forgotPassword` - Request password reset
- `PATCH /api/v1/users/resetPassword/:token` - Reset password
- `PATCH /api/v1/users/updatePassword` - Update current password

### User Management
- `GET /api/v1/users/getMe` - Get current user profile
- `PATCH /api/v1/users/updateMe` - Update user profile
- `GET /api/v1/users/friends` - Get user's friends
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users/:id/friends` - Get specific user's friends
- `POST /api/v1/users/:id/addFriend` - Send friend request
- `POST /api/v1/users/:id/acceptFriendship` - Accept friend request
- `POST /api/v1/users/:id/unfriend` - Remove friend

### Posts
- `POST /api/v1/posts/` - Create new post
- `GET /api/v1/posts/getFeed` - Get news feed
- `GET /api/v1/posts/getMyPosts` - Get user's posts
- `GET /api/v1/posts/:id` - Get specific post
- `PATCH /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `POST /api/v1/posts/:id/like` - Like/unlike post
- `POST /api/v1/posts/:id/comment` - Add comment
- `DELETE /api/v1/posts/:id/comment/:commentId` - Delete comment

## 🔍 API Features

### Example Requests

**Create a post:**
```bash
POST /api/v1/posts/
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "content": "My first post!",
  "image": "path/to/image.jpg"
}
```

**Get news feed:**
```bash
GET /api/v1/posts/getFeed
Authorization: Bearer <your-jwt-token>
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

Or the API will automatically read from the `jwt` cookie if present.

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token expiration
- HTTP security headers via Helmet
- Input validation with Mongoose schemas
- Comprehensive error handling
- Authentication middleware for protected routes
- Image upload type validation

## 🚀 Deployment

The application is configured for both development and production environments:

- Development: Detailed error messages and logging
- Production: Secure error handling and optimized performance

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## 📞 Contact

For questions or support, please contact [ziadkhaledwahba219@gmail.com]

---

Built with ❤️ using Node.js and Express