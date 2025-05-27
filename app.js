import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/authRoutes.js";
import kosRoutes from "./routes/kosRoutes.js";
import reservaseRoutes from "./routes/reservaseRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/kos", kosRoutes);
app.use("/api/auth", authRouter);
app.use("/api/reservase", reservaseRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "uploads/images")));

const clientOptions = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};
// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI, clientOptions)
  .then(() => {
    console.log("MongoDB Connected");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
