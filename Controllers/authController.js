import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import { errorHandler } from "../Utils/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import transporter from "../Utils/mailer.js";
import validator from "validator";
import {
  EMAIL_VERIFY_SUCCESS_TEMPLATE,
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
  WELCOME_TEMPLATE,
} from "../Utils/emailTemplates.js";

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // validate datas
    if (!name || !email || !password) {
      return next(
        errorHandler(400, "name, email and password all are required")
      );
    }

    if (!validator.isEmail(email)) {
      return next(errorHandler(400, "Invalid email format"));
    }

    if (
      !validator.isStrongPassword(password, {
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

    // Check for existing user with the same email
    const existingUser = await User.findOne({ email });

    // return if user already exist
    if (existingUser) {
      return next(errorHandler(409, "User Already Exists"));
    }

    // If user is not already exist , create new user
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // store the user details in the database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      registerType: "email",
      lastLoginAt: Date.now(),
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // convert 1 day into milli seconds
    });

    // Extract only the desired fields from the user object
    // const userObj = newUser.toObject(); //another method

    const {
      password: _,
      otp,
      otpExpireAt,
      resetToken,
      resetTokenExpireAt,
      ...userDetails
    } = newUser._doc; //userObj;

    return res.status(201).json({
      success: true,
      message: "User Registered successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(errorHandler(400, "Both email and password required"));
  }

  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format"));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User Not found"));

    if (validUser.registerType === "google" && !validUser.emailPasswordLinked)
      return next(
        errorHandler(
          400,
          "You are not linked your Email ID and Password. Please Try Login using Google account instead"
        )
      );

    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Invalid Credentials"));

    validUser.lastLoginAt = Date.now();
    await validUser.save();

    /*   const { password: hashPassword, ...rest } = validUser._doc; */
    const token = generateToken(validUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // convert 1 day into milli seconds
    });

    // Only extract neccessary details
    // Another method: const userObj = validUser.toObject();

    const {
      password: _,
      otp,
      otpExpireAt,
      resetToken,
      resetTokenExpireAt,
      ...userDetails
    } = validUser._doc; //userObj;

    res.status(200).json({
      success: true,
      message: "User loggedin successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  if (!req.body || !req.body.email) {
    return next(errorHandler(400, "Email Not Received Request"));
  }

  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "-password"
    );

    if (user) {
      
      if (user.registerType === "google") {
        const token = generateToken(user);
        user.lastLoginAt = Date.now();
        await user.save();

        // Only extract neccessary details
        // const userObj = user.toObject();

        const {
          password: _,
          otp,
          otpExpireAt,
          resetToken,
          resetTokenExpireAt,
          ...userDetails
        } = user._doc; //userObj;

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
          maxAge: 24 * 60 * 60 * 1000, // convert  1 day into milli seconds
        });

        return res.status(200).json({
          success: true,
          message: "User Loggedin successfully",
          user: userDetails,
        });
      } else {
        return next(
          errorHandler(
            400,
            "The email not  registered using google account. Please Try login using  email ID and password"
          )
        );
      }
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const name = req.body.name;

      const email = req.body.email;

      const profile = req.body.profile;

      // Validate input
      if (!name || !email || !profile) {
        return next(
          errorHandler(400, "Name, email, profile all fields are required")
        );
      }

      if (!validator.isEmail(email)) {
        return next(errorHandler(400, "Invalid email format"));
      }

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        profile,
        registerType: "google",
        lastLoginAt: Date.now(),
        emailVerified: true,
      });

      await newUser.save();

      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to SafePass",
        html: WELCOME_TEMPLATE.replace("{{name}}", name)
          .replace("{{front end link}}", process.env.FRONTEND_URL)
          .replaceAll("{{your company name}}", "SafePass"),
      };
      await transporter.sendMail(mailOptions);

      const token = generateToken(newUser);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
        maxAge: 24 * 60 * 60 * 1000, // convert 7days into milli seconds
      });

      // Only extract neccessary details
      //Another Method: const userObj = newUser.toObject();

      const {
        password: _,
        otp,
        otpExpireAt,
        resetToken,
        resetTokenExpireAt,
        ...userDetails
      } = newUser._doc; // userObj;

      res.status(201).json({
        success: true,
        message: "User Registered successfully",
        user: userDetails,
      });
    }
  } catch (error) {
    next(error);
  }
};

// isAuthenticated
export const isAuthenticated = async (req, res) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "User not authenticated" });
  }

  const {
    password: _,
    otp,
    otpExpireAt,
    resetToken,
    resetTokenExpireAt,
    ...userDetails
  } = req.user._doc; // userObj;

  res
    .status(200)
    .json({ success: true, message: "User Authenticated", user: userDetails });
};

// Logout
export const logOut = async (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "strict",
    })
    .status(200)
    .json({ success: false, message: "User logged out successfully" });
};

// Send password reset link
export const forgotPassword = async (req, res, next) => {
  // Destructure Email
  const { email } = req.body;

  // Validate email
  if (!email) {
    return next(errorHandler(400, "Email is required"));
  }

  if (!validator.isEmail(email)) {
    return next(errorHandler(400, "Invalid email format"));
  }

  try {
    // Retrieve the user data from Database
    const user = await User.findOne({ email });

    // If user is not found
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const hashedToken = await bcrypt.hash(token, 10);

    // store reset token in database
    user.resetToken = hashedToken;
    user.resetTokenExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes in milliseconds from otp generated time

    // save in the database
    await user.save();

    // Send the reset token to user mail;
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: PASSWORD_RESET_TEMPLATE.replace("{{name}}", user.name)
        .replace("{{resetLink}}", resetLink)
        .replace("{{your company name}}", "SafePass"),
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      return next(errorHandler(400, "Error sending Reset Link to Your Email"));
    }

    res.status(200).json({
      success: true,
      message: "Reset link sent to your Email successfuly",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset User password
export const resetPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const { token } = req.query;

  if (!token || !newPassword) {
    return next(errorHandler(400, "token and new Password are required"));
  }

  // Validate input
  if (!newPassword) {
    return next(errorHandler(400, "password is required"));
  }

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
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return next(errorHandler(404, "User not Found"));
    }

    const isValid = await bcrypt.compare(token, user.resetToken);
    if (!isValid) {
      return next(errorHandler(401, "Invalid token"));
    }

    if (!user.resetToken || decodedToken.id !== user._id.toString()) {
      return next(errorHandler(401, "Not Authorized"));
    }

    if (user.resetTokenExpireAt < Date.now()) {
      return next(errorHandler(410, "Token Expired"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpireAt = 0;

    await user.save();

    // Send the password reset success mail;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE.replace("{{name}}", user.name)
        .replace("{{Login Link}}", process.env.FRONTEND_URL)
        .replace("{{your company name}}", "SafePass"),
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {}

    res
      .status(200)
      .json({ success: true, message: "Password Reset successful" });
  } catch (error) {
    next(error);
  }
};

// Send Verification OTP
export const sendVerifyOtp = async (req, res, next) => {
  try {
    // Get userId and destructure it
    const { id, name, email } = req.user;

    // Check for the user in database
    const user = await User.findById(id);

    // if user not found, send message
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    // If Account already verified
    if (user.emailVerified) {
      return next(errorHandler(409, "Account already verified"));
    }

    // Generate otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // store otp in database
    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpireAt = Date.now() + 4 * 60 * 60 * 1000; // 4 h in milliseconds from otp generated time

    // save in the database
    await user.save();

    // Send the otp to user mail;
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Verification",
      // text: `Your OTP is ${otp}. Verify your account using this OTP `,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp)
        .replace("{{Your Company Name}}", "SafePass")
        .replace("{{name}}", name),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      return next(errorHandler(400, "Error Sending OTP to your email"));
    }

    res.status(200).json({ success: true, message: "otp send successfully" });
  } catch (error) {
    next(error);
  }
};

// Verify account
export const verifyEmail = async (req, res, next) => {
  try {
    // Destructure the data
    const { otp } = req.body;
    const { id } = req.user;

    // Validate data
    if (!otp) {
      return next(errorHandler(400, "OTP is required"));
    }

    // Find the user from the database
    const user = await User.findById(id);

    // If User not exists
    if (!user) {
      return next(errorHandler(404, "User Not Found"));
    }

    // Validate and verify OTP
    if (user.otp === "") {
      return next(errorHandler(401, "Invalid OTP"));
    }

    // Check if the OTP expired
    if (user.otpExpireAt < Date.now()) {
      return next(errorHandler(410, "OTP is expired"));
    }

    // Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return next(errorHandler(401, "Invalid OTP"));
    }

    // Make accound verify true and reset datas
    user.emailVerified = true;
    user.otp = null;
    user.otpExpireAt = 0;

    await user.save(); // save the change

    const {
      password,
      otp: _,
      otpExpireAt,
      resetToken,
      resetTokenExpireAt,
      ...userDetails
    } = user._doc; // userObj;

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verified successfully",
      html: EMAIL_VERIFY_SUCCESS_TEMPLATE.replace("{{name}}", user.name)
        .replace("{{Login Link}}", process.env.FRONTEND_URL)
        .replace("{{Your company Name}}", "SafePass"),
    };

    await transporter.sendMail(mailOptions);

    // return the success message
    return res.status(200).json({
      success: true,
      message: "email verified successfully",
      user: userDetails,
    });
  } catch (error) {
    next(error);
  }
};
