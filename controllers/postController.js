import cloudinary from "../lib/cloudinary.js";
import Comment from "../models/Comments.js";
import Post from "../models/PostModel.js";
import User from "../models/userModel.js";
// import mongoose from "mongoose";

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
  const { content, videoUrl, title, video, thumbnail } = req.body;

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
    let thumbnailUpload;

    if (thumbnail) {
      thumbnailUpload = await cloudinary.uploader.upload(thumbnail);
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
      thumbnail: thumbnailUpload.secure_url,
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
  const userId = req.user.id;
  const limit = 10;
  const batchSize = 10;

  try {
    const totalPosts = await Post.countDocuments();

    if (totalPosts === 0) {
      return res.status(200).json({
        message: "No posts in the database",
        success: true,
        posts: [],
      });
    }

    // Get a random start index within range
    let randomSkip = Math.floor(
      Math.random() * Math.max(totalPosts - batchSize, 1)
    );
    let skip = randomSkip;
    let filteredPosts = [];
    let allCheckedPosts = new Set();

    // Try from random point forward
    while (filteredPosts.length < limit && allCheckedPosts.size < totalPosts) {
      const posts = await Post.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(batchSize)
        .populate("user")
        .populate("likedBy");

      if (posts.length === 0) break;

      for (const post of posts) {
        if (allCheckedPosts.has(post._id.toString())) continue;

        allCheckedPosts.add(post._id.toString());

        const alreadyViewed = post.viewedBy.some(
          (id) => id.toString() === userId.toString()
        );

        if (!alreadyViewed) {
          filteredPosts.push(post);
        }

        if (filteredPosts.length === limit) break;
      }

      skip += batchSize;
      if (skip >= totalPosts) skip = 0; // Wrap around like a loop
    }

    // If no new posts, reset viewedBy
    if (filteredPosts.length === 0) {
      const allPosts = await Post.find({});
      for (const post of allPosts) {
        const index = post.viewedBy.indexOf(userId);
        if (index !== -1) {
          post.viewedBy.splice(index, 1);
          await post.save();
        }
      }

      return res.status(401).json({
        message: "No new posts left. Viewed list reset. Try again!",
        success: true,
        posts: [],
      });
    }

    // Add user to viewedBy
    for (const post of filteredPosts) {
      if (!post.viewedBy.includes(userId)) {
        post.viewedBy.push(userId);
        await post.save();
      }
    }

    return res.status(200).json({
      message:
        filteredPosts.length < limit
          ? "Less than 10 unseen posts available"
          : "Posts fetched successfully",
      success: true,
      posts: filteredPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const likePost = async (req, res) => {
  const likerId = req.params.id;
  const postId = req.params.post;

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
  const userId = req.user.id;
  const limit = 8;
  const batchSize = 8;

  try {
    const totalPosts = await Post.countDocuments({ video: true });

    if (totalPosts === 0) {
      return res.status(200).json({
        message: "No reels in the database",
        success: true,
        posts: [],
      });
    }

    let randomSkip = Math.floor(
      Math.random() * Math.max(totalPosts - batchSize, 1)
    );
    let skip = randomSkip;
    let filteredPosts = [];
    let allCheckedPosts = new Set();

    while (filteredPosts.length < limit && allCheckedPosts.size < totalPosts) {
      const posts = await Post.find({ video: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(batchSize)
        .populate("user")
        .populate("likedBy");

      if (posts.length === 0) break;

      for (const post of posts) {
        const postIdStr = post._id.toString();
        if (allCheckedPosts.has(postIdStr)) continue;

        allCheckedPosts.add(postIdStr);

        const alreadyViewed = post.viewedBy.some(
          (id) => id.toString() === userId.toString()
        );

        if (!alreadyViewed) {
          filteredPosts.push(post);
        }

        if (filteredPosts.length === limit) break;
      }

      skip += batchSize;
      if (skip >= totalPosts) skip = 0;
    }

    if (filteredPosts.length === 0) {
      const allReelPosts = await Post.find({ video: true });

      for (const post of allReelPosts) {
        const index = post.viewedBy.indexOf(userId);
        if (index !== -1) {
          userId && post.viewedBy.splice(index, 1);
          await post.save();
        }
      }

      return res.status(200).json({
        message: "No new reels left. Viewed list reset. Try again!",
        success: true,
        posts: [],
      });
    }

    for (const post of filteredPosts) {
      if (!post.viewedBy.includes(userId)) {
        post.viewedBy.push(userId);
        await post.save();
      }
    }

    return res.status(200).json({
      message:
        filteredPosts.length < limit
          ? "Less than 10 unseen reels available"
          : "Reels fetched successfully",
      success: true,
      posts: filteredPosts,
    });
  } catch (error) {
    console.error("Error fetching reels:", error);
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
export const deletePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.query.postId;

  try {
    if (!postId || !userId)
      return res
        .status(401)
        .json({ message: "Post Id is required", success: false });
    const response = await Post.findByIdAndDelete({ _id: postId });
    if (response)
      return res
        .status(201)
        .json({ message: "Post deleted Successfully", response });
    res.json({ message: "No posts found " });
  } catch (error) {
    res.json({ message: error.message });
  }
};
