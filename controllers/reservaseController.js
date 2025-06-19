import Reservase from "../models/Reservase.js";
import Auth from "../models/Auth.js";
import Kos from "../models/Kos.js";
import mongoose from "mongoose";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const createReservase = async (req, res) => {
  const { slug, id_user } = req.params;

  try {
    const { nama, tanggal_lahir, nomor_hp, gender, email, metode_pembayaran } =
      req.body;

    if (
      !nama ||
      !tanggal_lahir ||
      !nomor_hp ||
      gender === undefined ||
      !email ||
      !metode_pembayaran ||
      !req.files?.kontrak ||
      !req.files?.bukti_pembayaran
    ) {
      return res.status(400).json({ message: "Mohon Isi Semua Field!" });
    }

    const existingUser = await Auth.findById(id_user);
    if (!existingUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (existingUser.reservaseKos) {
      return res.status(400).json({
        message: "User sudah melakukan reservasi",
        status: 400,
        data: existingUser,
      });
    }

    const kos = await Kos.findOne({ slug });
    if (!kos) {
      return res.status(404).json({ message: "Kos tidak ditemukan" });
    }

    if (
      ![
        "Bank Syariah Indonesia",
        "Bank Mandiri",
        "Bank Negara Indonesia",
        "Bank Tabungan Negara",
        "Bank Central Asia",
        "Bank Aceh Syariah",
      ].includes(metode_pembayaran)
    ) {
      return res.status(400).json({
        message: "Metode pembayaran tidak valid",
      });
    }

    const uploadImages = {};

    for (const key in req.files) {
      uploadImages[key] = [];

      for (const file of req.files[key]) {
        const result = await uploadToCloudinary(
          file.buffer,
          `reservase/${key}`
        );
        uploadImages[key].push(result.secure_url);
      }
    }

    const kontrakurl = uploadImages.kontrak ? uploadImages.kontrak[0] : null;

    const buktiPembayaranurl = uploadImages.bukti_pembayaran
      ? uploadImages.bukti_pembayaran[0]
      : null;

    const realGender = gender === "Laki";

    const newReservase = new Reservase({
      nama,
      tanggal_lahir,
      nomor_hp,
      gender: realGender,
      email,
      metode_pembayaran,
      kontrak: kontrakurl,
      bukti_pembayaran: buktiPembayaranurl,
      status: "pending",
      id_kos: kos._id,
      id_user,
    });

    await newReservase.save();

    existingUser.reservaseKos = newReservase._id;
    await existingUser.save();

    res.status(200).json({
      status: 200,
      message: "Berhasil Create Reservase",
      data: newReservase,
    });
  } catch (error) {
    console.error("Error createReservase:", error);
    return res.status(500).json({
      status: 500,
      message: "Server Error",
      data: error.message,
    });
  }
};

export const approveReservase = async (req, res) => {
  try {
    const { _id } = req.params;
    const { status, alasan } = req.body;

    const ownerId = req.user._id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status Tidak Valid",
        status: 400,
      });
    }

    const reservase = await Reservase.findById(_id)
      .populate({
        path: "id_kos",
        select: "id_owner",
      })
      .populate("id_user");

    if (!reservase) {
      return res.status(404).json({
        message: "Reservase Tidak Ditemukan",
        status: 404,
      });
    }

    if (reservase.id_kos.id_owner.toString() !== ownerId.toString()) {
      return res.status(403).json({
        message: "Anda tidak berhak meng-approve reservasi ini",
        status: 403,
      });
    }

    reservase.status = status;
    await reservase.save();

    if (global.io && reservase.id_user) {
      global.io
        .to(reservase.id_user._id.toString())
        .emit("Reservase Approval", {
          reservaseId: reservase._id,
          status,
          alasan: alasan || null,
        });
    }

    res.json({
      message: `Reservase berhasil di${
        status === "approved" ? "setujui" : "tolak"
      }`,
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal approve/reject Reservase",
      status: 500,
      error: error.message,
    });
  }
};

export const getReservaseStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { filter } = req.query;

    if (userRole === "owner") {
      const kosList = await Kos.find({ id_owner: userId });
      const kosIds = kosList.map((kos) => kos._id);
      const datas = await Reservase.find({
        status: "pending",
        id_kos: kosIds,
      })
        .populate("id_user", "email")
        .populate("id_kos");

      res.status(200).json({
        message: "Reservase Pending",
        status: 200,
        datas: datas,
      });
    }

    if (userRole === "user") {
      const query = { id_user: userId };
      if (filter) {
        query.status = filter;
      }

      const datas = await Reservase.find(query).populate("id_kos");
      return res.status(200).json({
        message: `Reservase Saya (${filter || "Semua"})`,
        status: 200,
        datas: datas,
      });
    }
    return res.status(403).json({
      message: "Role tidak dikenali",
      status: 403,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Internal Error",
      status: 500,
      error: error.message,
    });
  }
};

export const getReservaseByUserId = async (req, res) => {
  try {
    const { id_user } = req.params;

    const user = await Auth.findById(id_user);
    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        status: 404,
      });
    }

    const reservaseList = await Reservase.find({
      id_user: user._id,
      status: "approved",
    }).populate("id_kos");

    console.log("List Approve", reservaseList);

    if (reservaseList.length === 0) {
      return res.status(404).json({
        message: "Tidak ada reservasi untuk user ini",
        status: 404,
      });
    }

    res.status(200).json({
      message: "Data reservasi berhasil ditemukan",
      status: 200,
      data: reservaseList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server internal error",
      status: 500,
      error: error.message,
      data: error,
    });
  }
};

export const deleteReservaseByUserAndReservaseId = async (req, res) => {
  try {
    const { id_user, id_reservase } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id_user) ||
      !mongoose.Types.ObjectId.isValid(id_reservase)
    ) {
      return res.status(400).json({
        status: 400,
        message: "ID user atau ID reservasi tidak valid",
      });
    }
    const reservase = await Reservase.findOne({
      _id: id_reservase,
      id_user: id_user,
    });

    if (!reservase) {
      return res.status(404).json({
        status: 404,
        message: "Reservasi tidak ditemukan untuk user ini",
      });
    }

    await Reservase.deleteOne({ _id: id_reservase });

    res.status(200).json({
      message: "Reservasi berhasil dihapus",
      status: 200,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server internal error",
      error: error.message,
    });
  }
};

export const addReview = async (req, res) => {
  const { id_user, id_reservase } = req.params;
  const { bintang, komentar } = req.body;

  try {
    const user = await Auth.findById(id_user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    const reservase = await Reservase.findOne({
      _id: id_reservase,
      id_user: id_user,
    });

    if (!reservase) {
      return res.status(404).json({
        success: false,
        message: "Reservasi tidak valid atau tidak ditemukan.",
      });
    }

    const idKos = reservase.id_kos._id || reservase.id_kos;

    const kos = await Kos.findById(idKos);
    if (!kos) {
      return res.status(404).json({
        success: false,
        message: "Kos tidak ditemukan.",
      });
    }

    const uploadImages = {};

    for (const key in req.files) {
      uploadImages[key] = [];

      for (const file of req.files[key]) {
        const result = await uploadToCloudinary(
          file.buffer,
          `reservase/${key}`
        );
        uploadImages[key].push(result.secure_url);
      }
    }

    const imageUlasanUrl = uploadImages.fotoReview;

    const ulasanBaru = {
      nama: user.fullname,
      bintang: parseInt(bintang),
      komentar,
      imageUlasan: imageUlasanUrl,
      tanggal: new Date(),
    };

    kos.ulasan.push(ulasanBaru);

    const totalBintang = kos.ulasan.reduce((acc, u) => acc + u.bintang, 0);
    kos.avgBintang = totalBintang / kos.ulasan.length;

    await kos.save();

    return res.status(200).json({
      success: true,
      message: "Ulasan berhasil ditambahkan.",
      data: ulasanBaru,
    });
  } catch (error) {
    console.error("Gagal menambahkan ulasan:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menambahkan ulasan.",
    });
  }
};
