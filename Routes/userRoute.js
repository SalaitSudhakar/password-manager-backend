import express from 'express';
import { getUserData, updateProfile, updatePassword, deleteUser } from '../Controllers/userController.js';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import upload from '../Config/multer.js';


const route = express.Router();

route.get('/data', authMiddleware, getUserData);
route.patch('/update-profile', authMiddleware, upload.single("profile"), updateProfile);
route.patch('/update-password', authMiddleware, updatePassword);
route.delete('/delete', authMiddleware, deleteUser);

export default route;