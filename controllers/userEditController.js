import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, email, phoneNumber, password } = req.body;
    console.log(name);
    let profilePicUrl;

    // Handle profile image upload (base64)
    if (req.body.profilePic && req.body.profilePic.startsWith("data:")) {
      const uploadResponse = await cloudinary.uploader.upload(
        req.body.profilePic
      );
      profilePicUrl = uploadResponse.secure_url;
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (profilePicUrl) updateFields.profilePic = profilePicUrl;
    if (password && password.length > 0) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      updateFields.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};
