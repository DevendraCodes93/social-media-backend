import mongoose from "mongoose"

export const dbConnect = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI, {
    dbName:'AppUser'
    });
    console.log('db connected successfully')
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message);

    
  }
}