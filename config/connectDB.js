import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};