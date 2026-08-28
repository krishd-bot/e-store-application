import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../config/nodemailer.js";
import { welcomeEmail, passwordResetEmail } from "../utils/emailTemplates.js";

// @desc  Register new user
// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  generateToken(res, user._id);

  sendEmail({ to: user.email, subject: "Welcome to Aurelia", html: welcomeEmail(user.name) });

  res.status(201).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Login user
// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  if (!user.isActive) {
    res.status(403);
    throw new Error("This account has been deactivated");
  }

  generateToken(res, user._id);
  res.json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc  Logout user (clear cookie)
// @route POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc  Get logged-in user's profile
// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc  Forgot password - emails reset link with token
// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() });
  if (!user) {
    // Don't reveal whether the email exists
    return res.json({ success: true, message: "If that email exists, a reset link was sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({ to: user.email, subject: "Reset your Aurelia password", html: passwordResetEmail(resetUrl) });

  res.json({ success: true, message: "If that email exists, a reset link was sent." });
});

// @desc  Reset password using token from email
// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Reset link is invalid or has expired");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful. Please log in." });
});
