import express from "express";
import {
  checkAuth,
  getAllUsers,
  login,
  logout,
  signUp,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleWare.js";

const router = express.Router();
router.post("/signup", signUp);
router.post("/login", login);
router.post("/check-auth", authMiddleware, checkAuth);
router.post("/logout", authMiddleware, logout);
router.get("/get-all-users", authMiddleware, getAllUsers);
export default router;
