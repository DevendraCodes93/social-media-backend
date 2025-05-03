import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import Comment from "../models/Comments.js";
import Post from "../models/PostModel.js";
import Story from "../models/StoryModel.js";
import User from "../models/userModel.js";

export const createStoryImage = async (req, res) => {
  const userId = req.user.id;
  const { imageUrl } = req.body;

  if (!imageUrl) {
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
    const newStory = new Story({
      user: userId,
      story: response.secure_url,
    });

    await newStory.save();
    return res.status(201).json({
      message: "Story created successfully",
      success: true,
      user,
      story: newStory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const createStoryVideo = async (req, res) => {
  const userId = req.user.id;
  const { videoUrl, isVideo } = req.body;
  if (!videoUrl) {
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
    const newStory = new Story({
      user: userId,
      story: response.secure_url,
      isVideo: isVideo,
    });

    await newStory.save();
    return res.status(201).json({
      message: "Story created successfully",
      success: true,

      story: newStory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
export const userStory = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!userId) return res.status(401).json(" user not found");
    const story = await Story.find({ user: userId }).populate("user");
    if (story)
      return res
        .status(200)
        .json({ message: "user story fetched successfully", story });
  } catch (error) {
    res.json({ message: "Internal server Error" });
  }
};
export const allUsersStory = async (req, res) => {
  const userId = req.user.id;

  try {
    const stories = await Story.aggregate([
      {
        $match: {
          user: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$user",
          stories: {
            $push: {
              _id: "$_id",
              story: "$story",
              isVideo: "$isVideo",
              viewedBy: "$viewedBy",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $lookup: {
          from: "appusers", // Make sure the collection name is correct
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: "$user.name",
          profilePic: "$user.profilePic",
          stories: 1,
        },
      },
    ]);

    res.json({ stories });
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
export const storyViewed = async (req, res) => {
  try {
    const userId = req.user.id;
    const viewerId = req.body.creatorId;
    console.log(viewerId);
    const story = await Story.findOneAndUpdate(
      { user: viewerId },
      { $addToSet: { viewedBy: userId } },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    res.status(200).json({ message: "View added", story });
  } catch (err) {
    console.error("Error adding view:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
