import express from "express";
const router = express.Router();
import * as kosController from "../controllers/kosController.js"; // Asumsi ekstensi .js

router.get("/filter", kosController.filterKos);
router.get("/", kosController.getAllKos);
router.get("/:id", kosController.getKosById);
router.put("/:id", kosController.updateKos);

export default router;
