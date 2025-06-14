import express from "express";
const authRouter = express.Router();
import * as authController from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadImages } from "../middleware/multer.js";
import { googleLogin } from "../controllers/authController.js";

authRouter.post("/register", uploadImages, authController.register);
authRouter.post("/login", authController.login);
authRouter.put("/change-password", authController.changePassword);
authRouter.put(
  "/update-profile",
  verifyToken,
  uploadImages,
  authController.updateProfile
);
authRouter.post("/save-kos/:id_kos", verifyToken, authController.saveKos);
authRouter.get("/getSaveKost", verifyToken, authController.getUser);
authRouter.get("/getProfile/:id", verifyToken, authController.getProfile);
authRouter.post("/google", googleLogin);

export default authRouter;
