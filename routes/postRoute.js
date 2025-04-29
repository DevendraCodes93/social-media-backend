import express from "express";
import { createPost, createPostVideo, getAllPosts } from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
const router = express.Router();

router.post("/create", authMiddleware, createPost);
router.post("/create-video", authMiddleware, createPostVideo);
router.get("/get-all-posts/:page", authMiddleware, getAllPosts);

export default router;
