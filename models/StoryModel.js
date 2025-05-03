import mongoose from "mongoose";

const storySchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },
    story: { type: String, required: true },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "AppUser" }],
    isVideo: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });
const Story = mongoose.model("Story", storySchema);
export default Story;
