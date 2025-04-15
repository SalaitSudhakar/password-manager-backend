# Password Manager API

A secure and efficient RESTful API for managing user authentication, profile data, and encrypted password storage. Built with **Node.js**, **Express**, **MongoDB**, and **JWT**.

---

## Features

- **User Authentication**: Register, login, logout, and Google OAuth
- **Email Verification**: OTP-based verification
- **Password Reset**: Forgot/reset password via email
- **User Profile**: Update profile image, password, and delete account
- **Password Vault**: Create, read, update, and delete stored passwords
- **Secure File Uploads**: Using Cloudinary and Multer
- **JWT & Cookie-Based Auth**: Secure session management
- **Input Validation**: Built-in sanitization and error handling
- **CORS Support**: Configured for frontend integration

---

## Technologies Used

- **Backend**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT, bcryptjs
- **File Upload**: multer, multer-storage-cloudinary
- **Email Services**: Nodemailer
- **Security**: Helmet, CORS, validator
- **Utilities**: dotenv, cookie-parser, crypto-js

---

## Getting Started

### Prerequisites

- Node.js
- MongoDB Atlas or local MongoDB
- Cloudinary Account (for profile image uploads)

### Installation

```bash
git clone https://github.com/SalaitSudhakar/password-manager-backend.git
cd password-manager-backend
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CRYPTO_SECRET=your_crypto_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development | production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PASS_EMAIL=your_email@example.com
PASS_KEY=your_email_pass_key
SENDER_EMAIL=your_email@example.com
```

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /register             | Register a new user           |
| POST   | /login                | Login a user                  |
| POST   | /logout               | Logout user and clear cookies |
| POST   | /forgot-password      | Send password reset email     |
| POST   | /reset-password       | Reset password with token     |
| POST   | /google               | Google sign-in                |
| GET    | /isAuthenticated      | Check session validity        |
| POST   | /send-otp             | Send OTP to verify email      |
| POST   | /verify-email         | Verify email with OTP         |

### User (`/api/user`)

| Method | Endpoint                    | Description                      |
|--------|-----------------------------|----------------------------------|
| GET    | /data                       | Fetch current user data         |
| PATCH  | /update-profile             | Update name/email/profile photo |
| PATCH  | /update-password            | Update current password         |
| POST   | /google/link-email-password| Link email/pass to Google user  |
| DELETE | /delete                     | Delete user account             |

### Passwords (`/api/password`)

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| POST   | /create                   | Create new password entry          |
| GET    | /get-passwords            | Get all passwords for user         |
| GET    | /get-password/:passwordId| Get password by ID                 |
| PUT    | /edit/:passwordId        | Edit password by ID                |
| DELETE | /delete/:passwordId      | Delete password by ID              |

---

## License

This project is licensed under the [ISC License](LICENSE).

---

## Author

**Salait Sudhakar**  
*Passionate Full Stack Developer building secure and functional applications.*
