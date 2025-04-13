import bcrypt from "bcryptjs";
import Password from "../Models/passwordModel.js";
import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";
import validator from "validator"; // Importing validator

export const createPassword = async (req, res, next) => {
  const { siteName, siteUrl, username, password, notes } = req.body;
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

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create passwordData object
  const passwordData = {};

  // Assign values to passwordData
  passwordData.siteName = siteName;
  passwordData.siteUrl = siteUrl;
  passwordData.password = hashedPassword;

  if (username) passwordData.username = username;
  if (notes) passwordData.notes = notes;

  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

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
