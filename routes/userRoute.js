import express from "express";
import {
  authUserPosts,
  checkAuth,
  getAllUsers,
  googleAuth,
  login,
  logout,
  signUp,
  userDetails,
} from "../controllers/userController.js";
import { updateUser } from "../controllers/userEditController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/check-auth", authMiddleware, checkAuth);
router.post("/logout", authMiddleware, logout);
router.get("/get-all-users", authMiddleware, getAllUsers);
router.get("/user-profile", authMiddleware, userDetails);
router.get("/auth-profile", authMiddleware, authUserPosts);
router.post("/google", googleAuth);
router.put("/user/update", authMiddleware, updateUser);
export default router;
