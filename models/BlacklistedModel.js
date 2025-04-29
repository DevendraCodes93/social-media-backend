import mongoose from "mongoose";

const blacklistedSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "12h", // Automatically remove the document after 12 hour
  },
});
const Blacklisted = mongoose.model("Blacklisted", blacklistedSchema);
export default Blacklisted;
