import express from 'express';
import { forgotPassword, google, isAuthenticated, login, logOut, register, resetPassword, sendVerifyOtp, verifyEmail } from '../Controllers/authController.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';


const route = express.Router();

route.post("/register", register);
route.post("/login", login);
route.post("/logout", logOut)
route.post("/forgot-password", forgotPassword);
route.post("/reset-password", resetPassword);
route.post("/google", google);
route.get('/isAuthenticated', authMiddleware, isAuthenticated)
route.post("/send-otp", authMiddleware,  sendVerifyOtp);
route.post("/verify-email", authMiddleware, verifyEmail);

export default route;