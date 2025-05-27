import express from "express";
const router = express.Router();
import * as reservaseConroller from "../controllers/reservaseController.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMemory = upload.single("imageUlasan");

router.post(
  "/:id_user/:id_kos",
  verifyToken,
  reservaseConroller.createReservase
);

router.get(
  "/user/:id_user",
  verifyToken,
  reservaseConroller.getReservaseByUserId
);

router.delete(
  "/user/:id_user/:id_reservase",
  verifyToken,
  reservaseConroller.deleteReservaseByUserAndReservaseId
);

router.post(
  "/review/:id_user/:id_reservase",
  verifyToken,
  uploadMemory,
  reservaseConroller.addReview
);
export default router;
