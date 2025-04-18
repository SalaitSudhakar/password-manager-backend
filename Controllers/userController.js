import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";
import validator from "validator";
import bcrypt from 'bcryptjs';

// Get User Data
export const getUserData = async (req, res, next) => {
  try {
    const { id } = req.user; // Get User id from middleware

    // Check if user exist
    const user = await User.findById(id);

    // Send error response if user not found
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    // Get user Datas without the mentioned datas
    const {
      password,
      otp,
      otpExpireAt,
      resetToken,
      resetTokenExpireAt,
      ...userDetails
    } = user._doc; // userObj;

    res.status(200).json({
      success: true,
      message: "User Details Fetched Successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Update profile details
export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user; // Get user ID from auth middleware
    const updateData = {};

    // Update name if provided
    if (req.body.name) updateData.name = req.body.name;

    // Validate and update email
    if (req.body.email) {
      if (!validator.isEmail(req.body.email)) {
        return next(errorHandler(400, "Invalid Email"));
      }
      updateData.email = req.body.email;
    }
 
    // Update profile image if provided
    if (req.file && req.file.path) {
      updateData.profile = req.file.path;
    }

    /* IF the email not same as users registered email, then check the new email not already registered by someone else */
    if (req.user.email !== updateData.email){
      const isRegisteredEmail = await User.findOne({email: updateData.email});

    // Check if a email registered
    if (isRegisteredEmail) return next(errorHandler(400, "This Email Already Registered"))

    }
    
    // Update user and return new data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User Not Found"));
    }

    // Remove sensitive fields
    const {
      password,
      otp,
      otpExpireAt,
      resetToken,
      resetTokenExpireAt,
      ...userDetails
    } = updatedUser.toObject();

    res.status(200).json({
      success: true,
      message: "User Profile Updated Successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Update password
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (oldPassword === newPassword) {
    return next(errorHandler(400, "Your previous password and New Password cannot be same"))
  }

  // Validate new password strength
  if (
    !validator.isStrongPassword(newPassword, {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return next(
      errorHandler(
        400,
        "Password must be at least 8 characters long and include a uppercase letter, a lowercase letter, a number, and a special character"
      )
    );
  }

  try {
    // Fetch user and check old password in one query
    const user = await User.findById(id).select("password");
    if (!user) return next(errorHandler(404, "User not found!"));

    // Compare old password
    const matchPassword = await bcrypt.compare(oldPassword, user.password);
    if (!matchPassword)
      return next(errorHandler(400, "Old password is incorrect"));

    // Hash and update new password in a single operation
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save(); // Save updated user

    return res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    next(error);
  }
};

// set Password (only for the user registered with Google and email password not linked)
export const linkEmailPassword = async (req, res, next) => {
  const { id } = req.user;
  const { password } = req.body;

  if (!validator.isStrongPassword(password, {
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })){
    return next(errorHandler(400, "Password must be at least 8 characters long and include a uppercase letter, a lowercase letter, a number, and a special character"))
  }
  
  try {
    const user = await User.findById(id);

    if (!user) return next(errorHandler(404, "User Not found"));

    if (user.registerType !== 'google') return next(errorHandler(400, "You are not registered with Google. You cannot use this method to update password"))

    if (user.emailPasswordLinked) return next(errorHandler(400, "Your email and password already Linked"));

    user.password = await bcrypt.hash(password, 10);
    user.emailPasswordLinked = true;
    user.save();

    res.status(200).json({success: true, message: "Your password and email linked successfully"})
  } catch (error) {
    next(error)
  }
}

// Delete Account
export const deleteUser = async (req, res, next) => {
  const { id } = req.user;

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) return next(errorHandler(404, "User not found"));

    res.status(200).json({success: true, message: "User Deleted Successfully"})
  } catch (error) {
    next(error)
  }
};
