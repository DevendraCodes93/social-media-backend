import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import cookieParser from "cookie-parser";
import { dbConnect } from "./lib/db.js";
dotenv.config();
/**/
const app = express();
app.use(cookieParser());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// https://socialdev1.netlify.app
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
dbConnect();
app.use("/api/auth", userRouter);
app.use("/api/post", postRouter);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("server running on port 3001");
});
