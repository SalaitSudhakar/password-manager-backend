import express from 'express';
import { updateProfile, updatePassword, deleteUser, linkEmailPassword, getUserData } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import upload from '../Config/multer.js';


const route = express.Router();

route.get('/data', authMiddleware, getUserData);
route.patch('/update-profile', authMiddleware, upload.single("profile"), updateProfile);
route.patch('/update-password', authMiddleware, updatePassword);
route.post('/google/link-email-password', authMiddleware, linkEmailPassword); // You are linking this for the first time, so use post method
route.delete('/delete', authMiddleware, deleteUser);

export default route;