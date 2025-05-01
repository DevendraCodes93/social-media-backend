import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/generateToken.js";
import Blacklisted from "../models/BlacklistedModel.js";
import Post from "../models/PostModel.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
export const checkAuth = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(400)
      .json({ message: "No token provided", success: false });
  const blacklistedToken = await Blacklisted.findOne({ token });

  if (blacklistedToken)
    return res
      .status(401)
      .json({ message: "Token is blacklisted", success: false });

  const user = await User.findById(req.user.id).select("-password");

  if (!user)
    return res.status(401).json({ message: "User not found", success: false });

  return res.status(200).json({ message: "User found", success: true, user });
};
export const signUp = async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  const { profilePic } = req.body;
  console.log(profilePic);
  let profilePicUrl = null;
  if (profilePic) {
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    console.log(uploadResponse);
    profilePicUrl = uploadResponse.secure_url;
  }

  if (!name || !email || !phoneNumber || !password)
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  if (password.length < 6)
    return res.status(400).json({
      message: "Password must be greater that 6 characters",
      success: false,
    });
  const user = await User.findOne({ email });
  if (user)
    return res
      .status(400)
      .json({ message: "User already exists", success: false });

  const userWithPhoneNumber = await User.findOne({ phoneNumber });
  if (userWithPhoneNumber)
    return res
      .status(400)
      .json({ message: "User already exists", success: false });
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
    profilePic: profilePicUrl,
  });

  await newUser.save();
  const token = await generateToken(newUser, res);
  return res.status(201).json({
    message: "User created successfully",
    success: true,
    token,
    newUser,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(400)
      .json({ message: "User does not exist", success: false });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res
      .status(400)
      .json({ message: "Invalid credentials", success: false });

  const token = await generateToken(user, res);
  return res
    .status(200)
    .json({ message: "Login successful", success: true, token, user });
};
export const logout = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token provided" });
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  // Add the token to the blacklist
  const blacklistedToken = new Blacklisted({ token });
  await blacklistedToken.save();

  return res.status(200).json({ message: "Logout successful", success: true });
};
export const getAllUsers = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(400)
      .json({ message: "No token provided", success: false });
  const userId = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(userId.id).select("-password");
  if (!user)
    return res.status(401).json({ message: "User not found", success: false });
  const users = await User.find({ _id: { $ne: user._id } }).select("-password");
  return res.status(200).json({
    message: "Users fetched for story successfully",
    success: true,
    users,
  });
};
export const userDetails = async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(401).json({ message: "userId is missing" });
    const user = await User.findById(userId).select("-password");
    const userPosts = await Post.find({ user: userId }).populate("user");
    if (!user) return res.status(401).json({ message: "User not found" });
    res
      .status(200)
      .json({ message: "user fetched successfully", userPosts, user });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
