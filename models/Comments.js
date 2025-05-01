import mongoose from "mongoose";
const commentSchema = mongoose.Schema(
  {
    commenterId: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },
    comment: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
