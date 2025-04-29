import cloudinary from "../lib/cloudinary.js";
import Post from "../models/PostModel.js";
import User from "../models/userModel.js";

export const createPost = async (req, res) => {
  const userId = req.user.id;
  const { content, imageUrl, title } = req.body;
  if (!title || !imageUrl) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const response = await cloudinary.uploader.upload(imageUrl);
    const newPost = new Post({
      user: userId,
      content: content,
      title,
      post: response.secure_url,
    });

    await newPost.save();
    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      content: content,
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const createPostVideo = async (req, res) => {
  const userId = req.user.id;
  const { content, videoUrl, title, video } = req.body;
  if (!title || !videoUrl) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    const response = await cloudinary.uploader.upload(videoUrl, {
      resource_type: "video",
      folder: "videos",
      max_file_size: 500 * 1024 * 1024,
    });
    const newPost = new Post({
      user: userId,
      content: content,
      title,
      post: response.secure_url,
      video,
    });

    await newPost.save();
    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      content: content,
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const getPosts = async (req, res) => {
  const userId = req.user.id;
  try {
    const posts = await Post.find({}).populate("user", "name email _id");
    if (!posts) {
      return res
        .status(404)
        .json({ message: "No posts found", success: false });
    }
    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const getAllPosts = async (req, res) => {
  const page = parseInt(req.params.page);
  const limit = 10;
  try {
    const skip = page * limit;
    const posts = await Post.find({})
      .populate("user")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    console.log(posts);

    if (posts.length === 0) {
      return res.status(404).json({
        message: "No posts found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
