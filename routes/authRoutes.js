const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/authController");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { verifyToken } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMemory = upload.single("fotoProfil");

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.put("/change-password", authController.changePassword);
authRouter.put(
  "/update-profile",
  verifyToken,
  uploadMemory,
  authController.updateProfile
);
authRouter.post("/save-kos/:id_kos", verifyToken, authController.saveKos);
authRouter.get("/getSaveKost", verifyToken, authController.getUser);

module.exports = authRouter;
