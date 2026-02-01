import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI); // TEMP DEBUG

    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("DB Error", error);
    process.exit(1);
  }
};
