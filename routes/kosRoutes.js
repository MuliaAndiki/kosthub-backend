import express from "express";
const kosRouter = express.Router();
import * as kosController from "../controllers/kosController.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { uploadImages } from "../middleware/multer.js";

kosRouter.get("/filter", kosController.filterKos);
kosRouter.get("/", kosController.getAllKos);

kosRouter.get(
  "/pending",
  verifyToken,
  requireRole(["admin", "owner"]),
  kosController.getPendingKos
);

kosRouter.get(
  "/approve",
  verifyToken,
  requireRole(["owner"]),
  kosController.getApprovegKos
),
  kosRouter.get("/:slug", kosController.getKosBySlug);
kosRouter.put("/:slug", kosController.updateKos);

kosRouter.post(
  "/create",
  verifyToken,
  requireRole(["owner"]),
  uploadImages,
  kosController.createKos
);

kosRouter.patch(
  "/:id/approve",
  verifyToken,
  requireRole(["admin"]),
  kosController.approveKos
);

export default kosRouter;
