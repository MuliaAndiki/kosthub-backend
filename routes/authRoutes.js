import express from "express";
const authRouter = express.Router();
import * as authController from "../controllers/authController.js";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMemory = upload.single("fotoProfil");

authRouter.post("/register", uploadMemory, authController.register);
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

export default authRouter;
