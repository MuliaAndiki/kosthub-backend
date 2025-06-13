import express from "express";
const router = express.Router();
import * as reservaseConroller from "../controllers/reservaseController.js";
import { verifyToken } from "../middleware/auth.js";
import { uploadImages } from "../middleware/multer.js";

router.post(
  "/:id_user/:id_kos",
  verifyToken,
  uploadImages,
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
  uploadImages,
  reservaseConroller.addReview
);
export default router;
