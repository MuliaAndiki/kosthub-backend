import express from "express";
const router = express.Router();
import * as kosController from "../controllers/kosController.js"; // Asumsi ekstensi .js
import { verifyToken, requireRole } from "../middleware/auth.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadKos = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);


router.get("/filter", kosController.filterKos);
router.get("/", kosController.getAllKos);
router.get("/:id", kosController.getKosById);
router.put("/:id", kosController.updateKos);


router.post(
  "/",
  verifyToken,
  requireRole(["owner"]),
  uploadKos,
  kosController.createKos
);


router.get(
  "/pending",
  verifyToken,
  requireRole(["admin"]),
  kosController.getPendingKos
);


router.patch(
  "/:id/approve",
  verifyToken,
  requireRole(["admin"]),
  kosController.approveKos
);

export default router;
