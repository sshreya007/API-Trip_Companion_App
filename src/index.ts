// import express from "express";
// import dotenv from "dotenv";
// import { connectDB } from "./database/mongodb";
// import authRoutes from "./routes/auth.route";
// import { PORT } from "./config";
// import cors from "cors";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());



// app.use("/api/auth", authRoutes); // FRONTEND WILL CALL THIS

// app.use("/api/auth", authRoutes);

// app.listen(PORT, () => {
//   console.log("Server running on", PORT);
// });
import dotenv from "dotenv";
dotenv.config(); // 👈 MUST be first

import { connectDB } from "./database/mongodb";
import app from './app';

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

