const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRouter = require("./routes/authRoutes");
const kosRoutes = require("./routes/kosRoutes");
const reservaseRoutes = require("./routes/reservaseRoutes");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/kos", kosRoutes);
app.use("/api/auth", authRouter);
app.use("/api/reservase", reservaseRoutes);

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
