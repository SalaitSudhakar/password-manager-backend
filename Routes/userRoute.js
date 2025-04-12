import express from 'express';
import { updateProfile, updatePassword, deleteUser, linkEmailPassword } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import upload from '../Config/multer.js';


const route = express.Router();

// route.get('/data', authMiddleware, getUserData);
route.patch('/update-profile', authMiddleware, upload.single("profile"), updateProfile);
route.patch('/update-password', authMiddleware, updatePassword);
route.patch('/google/link-email-password', authMiddleware, linkEmailPassword)
route.delete('/delete', authMiddleware, deleteUser);

export default route;