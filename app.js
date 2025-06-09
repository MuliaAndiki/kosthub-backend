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
import http from "http";
import { Server as SocketIOServer } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});
global.io = io;

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));
app.use("/api/kos", kosRoutes);
app.use("/api/auth", authRouter);
app.use("/api/reservase", reservaseRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/images", express.static(path.join(__dirname, "uploads/images")));

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
});

const clientOptions = {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
};

mongoose
  .connect(process.env.MONGO_URI, clientOptions)
  .then(() => {
    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
