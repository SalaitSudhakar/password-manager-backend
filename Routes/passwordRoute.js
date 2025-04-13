import express from 'express';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import { createPassword, deletePasswordById, editPassword, getPasswordById, getPasswords } from '../Controllers/passwordController.js';

const route = express.Router();

route.post('/create', authMiddleware, createPassword);
route.get('/get-passwords', authMiddleware, getPasswords);
route.get('/get-password/:passwordId', authMiddleware, getPasswordById);
route.put("/edit/:passwordId", authMiddleware, editPassword);
route.delete("/delete/passwordId", authMiddleware, deletePasswordById);

export default route;