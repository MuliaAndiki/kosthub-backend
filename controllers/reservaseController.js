const Reservase = require("../models/Reservase");
const Auth = require("../models/Auth");
const Kos = require("../models/Kos");
const path = require("path");

exports.createReservase = async (req, res) => {
  const { id_kos, id_user } = req.params;

  try {
    const {
      nama,
      tanggal_lahir,
      nomor_hp,
      gender,
      email,
      metode_pembayaran,
      kontrak,
      bukti_pembayaran,
    } = req.body;

    if (
      !nama ||
      !tanggal_lahir ||
      !nomor_hp ||
      gender === undefined ||
      !email ||
      !metode_pembayaran ||
      !kontrak ||
      !bukti_pembayaran
    ) {
      return res.status(400).json({ message: "Mohon Isi Semua Field!" });
    }

    // Cari user
    const existingUser = await Auth.findById(id_user);
    if (!existingUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek apakah sudah reservasi sebelumnya
    if (existingUser.reservaseKos) {
      return res.status(400).json({
        message: "User sudah melakukan reservasi",
        status: 400,
        data: existingUser,
      });
    }

    const kos = await Kos.findOne({ id_kos: parseInt(id_kos) });
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
        message: "Periode penyewaan harus 'Bulan' atau 'Tahun'",
      });
    }

    const realGender = gender === "Laki" ? true : false;

    const newReservase = new Reservase({
      nama,
      tanggal_lahir,
      nomor_hp,
      gender: realGender,
      email,
      metode_pembayaran,
      kontrak,
      bukti_pembayaran,
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

exports.getReservaseByUserId = async (req, res) => {
  try {
    const { id_user } = req.params;

    const user = await Auth.findById(id_user);
    if (!user) {
      return res.status(404).json({
        message: "User tidak ditemukan",
        status: 404,
      });
    }

    const reservaseList = await Reservase.find({ id_user: user._id }).populate(
      "id_kos"
    );

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

const mongoose = require("mongoose");

exports.deleteReservaseByUserAndReservaseId = async (req, res) => {
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

exports.addReview = async (req, res) => {
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

    const imageUlasan = req.file?.filename;
    if (!imageUlasan) {
      return res.status(400).json({
        success: false,
        message: "Gambar ulasan diperlukan.",
      });
    }

    const ulasanBaru = {
      nama: user.fullname,
      bintang: parseInt(bintang),
      komentar,
      imageUlasan,
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
