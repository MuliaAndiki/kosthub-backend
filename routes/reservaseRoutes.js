const express = require("express");
const router = express.Router();
const reservaseConroller = require("../controllers/reservaseController");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const { uploadToCloudinary } = require("../utils/cloudinary");

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
module.exports = router;
