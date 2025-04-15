import express from "express";
import dotenv from "dotenv";
import connectDb from "./Database/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from './Routes/authRoute.js'
import userRoute from './Routes/userRoute.js'
import passwordRoute from './Routes/passwordRoute.js'

dotenv.config();

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/password", passwordRoute);

// Error Middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  return res.status(statusCode).json({ success: false, message: message });
});

connectDb();

app.listen(port, (req, res) => {
  console.log("Server is started and running on the port");
});
