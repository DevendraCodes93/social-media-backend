import mongoose from "mongoose";
const postSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    post: { type: String, required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "AppUser" }],
    video: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
