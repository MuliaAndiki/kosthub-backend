import express from "express";
const router = express.Router();
import * as kosController from "../controllers/kosController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { uploadImages } from "../middleware/multer.js";

router.get("/filter", kosController.filterKos);
router.get("/", kosController.getAllKos);

router.get(
  "/pending",
  verifyToken,
  requireRole(["admin"]),
  kosController.getPendingKos
);

router.get("/:id", kosController.getKosById);
router.put("/:id", kosController.updateKos);

router.post(
  "/",
  verifyToken,
  requireRole(["owner"]),
  uploadImages,
  kosController.createKos
);

router.patch(
  "/:id/approve",
  verifyToken,
  requireRole(["admin"]),
  kosController.approveKos
);

export default router;
