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
import profileRoutes from "./routes/profile.route"

dotenv.config(); // 👈 MUST be first

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.use("/api/auth", authRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5050;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});

