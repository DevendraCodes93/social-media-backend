import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, default: null },
    profilePic: {
      type: String,
      default: "",
    },
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AppUser", default: [] },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AppUser", default: [] },
    ],
    password: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("AppUser", userSchema);
export default User;
