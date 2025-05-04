import Blacklisted from "../models/BlacklistedModel.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  // Check if the token is blacklisted
  const isBlackListed = await Blacklisted.findOne({ token });

  if (isBlackListed) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
