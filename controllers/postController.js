import cloudinary from "../lib/cloudinary.js";
import Comment from "../models/Comments.js";
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
      user,
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
      user,
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
export const singlePost = async (req, res) => {
  const postId = req.query.postId;
  if (!postId) return res.status(400).json({ message: " postId is missing." });
  const post = await Post.findById(postId).populate("user");
  return res.status(201).json({
    message: "Fetched successfully",
    success: true,
    post: post,
  });
};
export const getAllPosts = async (req, res) => {
  const page = parseInt(req.params.page) || 0;
  const limit = 10;

  try {
    const totalPosts = await Post.countDocuments();
    const skip = page * limit;

    // If skip exceeds total posts, no more posts
    if (skip >= totalPosts) {
      return res.status(200).json({
        message: "No more posts",
        success: true,
        posts: [],
      });
    }

    // Adjust limit to avoid overflow
    const adjustedLimit = Math.min(limit, totalPosts - skip);

    const posts = await Post.find({})
      .sort({ createdAt: -1 }) // Optional: latest first
      .skip(skip)
      .limit(adjustedLimit)
      .populate("user")
      .populate("likedBy");

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

export const likePost = async (req, res) => {
  const likerId = req.params.id;
  const postId = req.params.post;
  console.log(likerId, postId);
  try {
    if (!postId) return;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likedBy.includes(likerId);

    if (alreadyLiked) {
      // Unlike
      await Post.findByIdAndUpdate(postId, { $pull: { likedBy: likerId } });
      return res.status(200).json({ message: "Post unliked", success: true });
    } else {
      // Like
      await Post.findByIdAndUpdate(postId, { $addToSet: { likedBy: likerId } });
      return res.status(200).json({ message: "Post liked", success: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const serveVideos = async (req, res) => {
  const page = parseInt(req.params.page);
  const limit = 10;
  const totalPosts = await Post.countDocuments();
  const postsToSample = totalPosts < 100 ? totalPosts : 100;
  try {
    const skip = page * limit;

    const postsInitial = await Post.find({ video: true })
      .populate("user")
      .populate("likedBy");
    const start = page * limit;
    const end = start + limit;
    const shuffledPosts = postsInitial.sort(() => Math.random() - 0.5);
    const postsForPage = shuffledPosts.slice(start, end);

    console.log(postsForPage);

    if (postsForPage.length === 0) {
      return res.status(404).json({
        message: "No posts found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts: postsForPage,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const postComment = async (req, res) => {
  const { comment } = req.body;
  const postId = req.query.postId;
  const userId = req.user.id;

  if (!comment || !postId)
    return res.status(400).json({ message: "Comment or postId is missing." });
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ message: "Post not found." });
    const newComment = new Comment({
      commenterId: userId,
      comment: comment,
      postId: postId,
    });

    await newComment.save();
    await newComment.populate("commenterId");
    await newComment.populate("postId");

    return res.status(200).json({
      message: "Commented successfully",
      success: true,
      comment: newComment,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error while commenting a post", error: error.message });
  }
};
export const getComments = async (req, res) => {
  const { postId } = req.query;
  console.log(postId);
  if (!postId) return res.status(400).json({ message: "postId is missing." });
  try {
    const post = await Comment.find({ postId })
      .populate("postId")
      .populate("commenterId");
    console.log(post);
    if (!post) return res.status(400).json({ message: "post not found" });
    return res.status(201).json({ message: "Fetched successfully", post });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error while fetching comments", error: error.message });
  }
};
