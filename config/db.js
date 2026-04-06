import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("DB connection error", error);
    process.exit(1);
  }    
  
  mongoose.connection.on("error", (error) => {
      console.log("Mongoose connection error:", err);
    });
};