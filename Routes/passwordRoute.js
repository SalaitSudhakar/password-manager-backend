import express from 'express';
import { authMiddleware } from './../Middleware/authMiddleware.js';
import { createPassword } from '../Controllers/passwordController.js';

const route = express.Router();

route.post('/create', authMiddleware, createPassword)

export default route;