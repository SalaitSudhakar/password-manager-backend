import jwt from "jsonwebtoken";
import { errorHandler } from "../Utils/errorHandler.js";
import User from "../Models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    if (!req.cookies?.token) {
      return next(errorHandler(401, "Token is missing"));
    }

    if (!process.env.JWT_SECRET) {
      return next(
        errorHandler(500, "JWT_SECRET is missing in environment variables")
      );
    }

    const tokenDecoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

    if (!tokenDecoded?.id) {
      return next(errorHandler(401, "Invalid token"));
    }

    const userData = await User.findById(tokenDecoded.id);
    if (!userData) {
      return next(errorHandler(401, "User not found"));
    }

    req.user = userData;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(errorHandler(401, "Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Token expired, please log in again"));
    }
    next(error);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(errorHandler(401, "Unauthorized. Please Login"));
  }

  if (req.user.role === "admin") {
    next();
  } else {
    return next(errorHandler(403, "Not Authorized"));
  }
};
