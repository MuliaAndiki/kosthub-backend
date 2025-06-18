import express from "express";
const reservaseRouter = express.Router();
import * as reservaseConroller from "../controllers/reservaseController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { uploadImages } from "../middleware/multer.js";

reservaseRouter.post(
  "/:id_user/:id_kos",
  verifyToken,
  uploadImages,
  reservaseConroller.createReservase
);

reservaseRouter.get(
  "/user/:id_user",
  verifyToken,
  reservaseConroller.getReservaseByUserId
);

reservaseRouter.delete(
  "/user/:id_user/:id_reservase",
  verifyToken,
  reservaseConroller.deleteReservaseByUserAndReservaseId
);

reservaseRouter.post(
  "/review/:id_user/:id_reservase",
  verifyToken,
  uploadImages,
  reservaseConroller.addReview
);

reservaseRouter.get(
  "/status",
  verifyToken,
  requireRole(["owner", "user"]),
  reservaseConroller.getReservaseStatus
);

reservaseRouter.patch(
  "/:_id/approve",
  verifyToken,
  requireRole(["owner"]),
  reservaseConroller.approveReservase
);

export default reservaseRouter;
