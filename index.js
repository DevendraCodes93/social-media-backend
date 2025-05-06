import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import storyRouter from "./routes/storyRoute.js";
import cookieParser from "cookie-parser";
import { dbConnect } from "./lib/db.js";
dotenv.config();
/**/
const app = express();
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// https://socialdev1.netlify.app
app.use(cors({ origin: " https://socialdev1.netlify.app", credentials: true }));
dbConnect();
app.use((req, res, next) => {
  res.setTimeout(500000, () => {
    res.status(408).send("Request Timeout");
  });
  next();
});

app.use("/api/auth", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("server running on port 3001");
});
