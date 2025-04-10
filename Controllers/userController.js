import User from "../Models/userModel.js";
import { errorHandler } from "../Utils/errorHandler.js";
import validator from 'validator';

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

// Update profile Details
 export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user; // Get id from auth Middleware
    const { profile, name, email } = req.body // Destructure datas from request body

    const user = await User.findById(id); // Get User details using id

    if (!user){
      return next(errorHandler(404, "User Not Found"));
    }

    // Validate user details
    validator.isEmail()

    // Update user data
    user.profile = profile


  } catch (error) {
    next(error);
  }
}; 

// Update password
export const updatePassword = async (req, res, next) =>{

} 

// Delete Account
export const deleteUser = async (req, res, next) => {

}
