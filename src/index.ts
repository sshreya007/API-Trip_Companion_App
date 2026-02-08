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
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path'; 

import { connectDB } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import profileRoutes from "./routes/profile.route";
import adminRoutes from './routes/admin.route'; 
import { errorHandler } from './errors/error-handler';

dotenv.config(); // 👈 MUST be first

const app = express();

// ✅ FIXED CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',  // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/auth", authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes); 

app.use(errorHandler);

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

//make app.ts and seperate app and sever then import app here in index
//1 instal dependency then in nodemodules script add test then jest config then seperate app from index then make test setup.ts
//integration testing 50 for extra marks unit testing
//run by - npm test