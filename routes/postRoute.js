import express from "express";
import {
  createPost,
  createPostVideo,
  getAllPosts,
  getComments,
  likePost,
  postComment,
  serveVideos,
  singlePost,
} from "../controllers/postController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";
const router = express.Router();

router.post("/create", authMiddleware, createPost);
router.post("/create-video", authMiddleware, createPostVideo);
router.get("/get-all-posts/:page", authMiddleware, getAllPosts);
router.get("/get-single-post", authMiddleware, singlePost);
router.post("/like-post/:id/:post", authMiddleware, likePost);
router.post("/get-videos/:page", authMiddleware, serveVideos);
router.post("/add-comment", authMiddleware, postComment);
router.get("/get-comment", authMiddleware, getComments);

export default router;
