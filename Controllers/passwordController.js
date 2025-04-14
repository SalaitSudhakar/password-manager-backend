import dotenv from "dotenv";
import Password from "../Models/passwordModel.js";
import { errorHandler } from "../Utils/errorHandler.js";
import validator from "validator"; // Importing validator
import mongoose from "mongoose";
import CryptoJS from "crypto-js";

dotenv.config();

//encrypt password
export const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, process.env.CRYPTO_SECRET).toString();
};

// decrypt password
export const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, process.env.CRYPTO_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const createPassword = async (req, res, next) => {
  const { siteName, siteUrl, username, password, notes, category, tags } =
    req.body;
  const { id } = req.user;

  // Validate required fields
  if (!siteName || !siteUrl || !password) {
    return next(
      errorHandler(
        400,
        "SiteName, siteUrl, and Password are required. Username and notes are optional."
      )
    );
  }

  // Validate the password strength
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
  ) {
    return next(
      errorHandler(
        400,
        "Password must be at least 8 characters long and include a lowercase letter, an uppercase letter, a symbol, and a number."
      )
    );
  }

  //   Validate site URL
  if (
    !validator.isURL(siteUrl, {
      require_protocol: true, // ensures http:// or https:// is present
    })
  ) {
    return next(errorHandler(400, "Invalid Site URL"));
  }

  /* validator.isURL(siteUrl, {
  protocols: ["http", "https"],
  require_protocol: true,
  require_tld: true, // ensures there's a .com, .net, etc.
});
 */

  // Default Tags
  const acceptedCategory = [
    "personal",
    "social",
    "banking",
    "work",
    "entertainment",
    "shopping",
    "others",
  ];
  if (!category || !acceptedCategory.includes(category))
    return next(errorHandler(400, "Invalid Password Category"));

  // encrypt Password
  const encryptedPassword = encrypt(password);

  // Create passwordData object & Assign values to passwordData
  const passwordData = {
    siteName,
    siteUrl,
    password: encryptedPassword,
  };

  if (username) passwordData.username = username;
  if (notes) passwordData.notes = notes;
  if (category) passwordData.category = category;
  if (tags) passwordData.tags = tags;

  try {
    const isSitePasswordAvailable = await Password.findOne({
      siteUrl,
      userId: id,
    });

    if (isSitePasswordAvailable)
      return next(
        errorHandler(409, "A password entry for this site already exists.")
      );

    // Create a new Password document
    const newPassword = new Password({
      ...passwordData,
      userId: id,
    });

    // Save the new password
    await newPassword.save();

    // Send success response
    res
      .status(201)
      .json({ success: true, message: "Password Created Successfully" });
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
};

// Get All passwords of this user
export const getPasswords = async (req, res, next) => {
  const { id } = req.user;

  try {
    const passwords = await Password.find({ userId: id });

    const decryptedPasswords = passwords.map((entry) => ({
      ...entry._doc,
      password: decrypt(entry.password),
    }));

    res.status(200).json({
      success: true,
      message: "Password Fetched Successfully",
      passwords: decryptedPasswords,
    });
    
  } catch (error) {
    next(error);
  }
};

// Get password by id
export const getPasswordById = async (req, res, next) => {
  const { passwordId } = req.params;
  const { id } = req.user;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(passwordId)) {
    return next(errorHandler(400, "Invalid password ID format"));
  }

  try {
    // Find password by _id and userId
    const password = await Password.findOne({ _id: passwordId, userId: id });

    // Check if password exists
    if (!password) {
      return next(errorHandler(404, "Password not found for this user"));
    }

    password.password = decrypt(password.password, process.env.CRYPTO_SECRET);
    res.status(200).json({
      success: true,
      message: "Password Details fetched successfully",
      password,
    });
  } catch (error) {
    next(error);
  }
};

// Edit Password datas
export const editPassword = async (req, res, next) => {
  const { siteName, siteUrl, username, password, notes, category, tags } =
    req.body;
  const { passwordId } = req.params;
  const { id } = req.user;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(passwordId)) {
    return next(errorHandler(400, "Invalid password ID format"));
  }

  // Validate required fields
  if (!siteName || !siteUrl || !password) {
    return next(
      errorHandler(
        400,
        "SiteName, siteUrl, and Password are required. Username and notes are optional."
      )
    );
  }

  // Validate the password strength
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    })
  ) {
    return next(
      errorHandler(
        400,
        "Password must be at least 8 characters long and include a lowercase letter, an uppercase letter, a symbol, and a number."
      )
    );
  }

  // Validate site URL
  if (
    !validator.isURL(siteUrl, {
      require_protocol: true, // ensures http:// or https:// is present
    })
  ) {
    return next(errorHandler(400, "Invalid Site URL"));
  }

  // Default Tags
  const acceptedCategory = [
    "personal",
    "social",
    "banking",
    "work",
    "entertainment",
    "shopping",
    "others",
  ];
  if (!category || !acceptedCategory.includes(category))
    return next(errorHandler(400, "Invalid Password Category"));

  // Initialize the passwordData object with updated values
  const passwordData = {
    siteName,
    siteUrl,
    username,
    notes,
    category,
    tags,
  };

  // Only Encrypt the password if it's being updated
  if (password) {
    passwordData.password = encrypt(password);
  }

  try {
    // Find the password document for the user
    const passwordDetails = await Password.findOne({
      _id: passwordId,
      userId: id,
    });

    if (!passwordDetails) {
      return next(errorHandler(404, "This password detail does not exist"));
    }

    // Update the password document with new values
    passwordDetails.siteName = passwordData.siteName;
    passwordDetails.siteUrl = passwordData.siteUrl;
    passwordDetails.password =
      passwordData.password || passwordDetails.password; // Only update password if provided

    if (passwordData.username) {
      passwordDetails.username = passwordData.username;
    }

    if (passwordData.notes) {
      passwordDetails.notes = passwordData.notes;
    }

    if (passwordData.category) {
      passwordDetails.category = passwordData.category;
    }

    if (passwordData.tags) {
      passwordDetails.tags = passwordData.tags;
    }

    // Save the updated password document
    await passwordDetails.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
};

// Delete Password By id
export const deletePasswordById = async (req, res, next) => {
  const { passwordId } = req.params;
  const { id } = req.user;

  // Validate the ObjectId format
  if (!mongoose.Types.ObjectId.isValid(passwordId)) {
    return next(errorHandler(400, "Invalid password ID format"));
  }

  try {
    // Ensure password belongs to the user before deleting
    const password = await Password.findOneAndDelete({
      _id: passwordId,
      userId: id,
    });

    if (!password) {
      return next(
        errorHandler(404, "Password not found or does not belong to this user")
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Password deleted successfully" });
  } catch (error) {
    next(error);
  }
};
