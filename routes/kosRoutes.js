const express = require("express");
const router = express.Router();
const kosController = require("../controllers/kosController");

router.get("/filter", kosController.filterKos);
router.get("/", kosController.getAllKos);
router.get("/:id", kosController.getKosById);
router.put("/:id", kosController.updateKos);

module.exports = router;
