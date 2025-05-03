import express from "express";

import { authMiddleware } from "../middlewares/authMiddleWare.js";
import {
  allUsersStory,
  createStoryImage,
  createStoryVideo,
  storyViewed,
  userStory,
} from "../controllers/storyController.js";
const router = express.Router();

router.post("/create", authMiddleware, createStoryImage);
router.post("/create-video", authMiddleware, createStoryVideo);
router.get("/user-story", authMiddleware, userStory);
router.get("/all-story", authMiddleware, allUsersStory);
router.post("/story-viewed", authMiddleware, storyViewed);

export default router;
