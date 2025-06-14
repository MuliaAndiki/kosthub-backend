import Kos from "../models/Kos.js";
import User from "../models/Auth.js";
import Reservase from "../models/Reservase.js";
import path from "path";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getAllKos = async (req, res) => {
  try {
    const data = await Kos.find({ status: "approved" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching all kos:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch kos", error: error.message });
  }
};

export const getKosById = async (req, res) => {
  try {
    const kos = await Kos.findOne({
      id_kos: req.params.id,
      status: "approved",
    });
    kos ? res.json(kos) : res.status(404).json({ message: "Tidak ditemukan" });
  } catch (error) {
    console.error("Error fetching kos by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch kos", error: error.message });
  }
};

export const updateKos = async (req, res) => {
  try {
    const updated = await Kos.findOneAndUpdate(
      { id_kos: req.params.id },
      req.body,
      { new: true }
    );
    updated
      ? res.json(updated)
      : res.status(404).json({ message: "Tidak ditemukan" });
  } catch (error) {
    console.error("Error updating kos:", error);
    res
      .status(500)
      .json({ message: "Failed to update kos", error: error.message });
  }
};

export const createKos = async (req, res) => {
  try {
    const {
      id_kos,
      nama_kos,
      alamat,
      fasilitas,
      harga_perbulan,
      harga_pertahun,
      kontak,
      deskripsi,
      tipe_kos,
    } = req.body;

    if (
      !id_kos ||
      !nama_kos ||
      !alamat ||
      !harga_perbulan ||
      !harga_pertahun ||
      !kontak ||
      !req.files ||
      !req.files.thumbnail
    ) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const uploadImages = {};

    for (const key in req.files) {
      uploadImages[key] = [];

      for (const file of req.files[key]) {
        const result = await uploadToCloudinary(file.buffer, `kos/${key}`);
        uploadImages[key].push(result.secure_url);
      }
    }

    const thumbnailUrl = uploadImages.thumbnail
      ? uploadImages.thumbnail[0]
      : null;
    const galleryUrls = uploadImages.gallery || [];

    let fasilitasArr = fasilitas;
    if (typeof fasilitas === "string") {
      try {
        fasilitasArr = JSON.parse(fasilitas);
      } catch {
        fasilitasArr = [];
      }
    }

    let kontakObj = kontak;
    if (typeof kontak === "string") {
      try {
        kontakObj = JSON.parse(kontak);
      } catch {
        kontakObj = {};
      }
    }

    const newKos = new Kos({
      id_kos,
      nama_kos,
      alamat,
      fasilitas: fasilitasArr,
      harga_perbulan,
      harga_pertahun,
      kontak: kontakObj,
      image: {
        thumbnail: thumbnailUrl,
        gallery: galleryUrls,
      },
      deskripsi: deskripsi || "",
      status: "pending",
      id_owner: req.user._id,
      tipe_kos: tipe_kos || "campur",
    });
    await newKos.save();
    res.status(201).json({
      message: "Kos berhasil ditambahkan, menunggu approval admin",
      data: newKos,
    });
  } catch (error) {
    console.error("Error create kos:", error);
    res
      .status(500)
      .json({ message: "Gagal menambah kos", error: error.message });
  }
};

export const getPendingKos = async (req, res) => {
  try {
    const data = await Kos.find({ status: "pending" }).populate(
      "id_owner",
      "username email"
    );
    res.json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal fetch kos pending", error: error.message });
  }
};

export const approveKos = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, alasan } = req.body;
    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }
    const kos = await Kos.findById(id).populate("id_owner");
    if (!kos) return res.status(404).json({ message: "Kos tidak ditemukan" });
    kos.status = status;
    await kos.save();

    if (global.io && kos.id_owner) {
      global.io.to(kos.id_owner._id.toString()).emit("kosApproval", {
        kosId: kos._id,
        status,
        alasan: alasan || null,
        nama_kos: kos.nama_kos,
      });
    }
    res.json({
      message: `Kos ${status === "approved" ? "disetujui" : "ditolak"}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal approve/reject kos", error: error.message });
  }
};

export const filterKos = async (req, res) => {
  const {
    fasilitas,
    minHarga,
    maxHarga,
    rating,
    tipeHarga,
    harga,
    lokasi,
    tipe,
  } = req.query;
  try {
    const pipeline = [];
    pipeline.push({ $match: { status: "approved" } });
    pipeline.push({
      $addFields: {
        avgBintang: { $round: [{ $avg: "$ulasan.bintang" }, 0] },
      },
    });
    let filterStage = { $match: {} };
    if (fasilitas) {
      const fasilitasArray = Array.isArray(fasilitas) ? fasilitas : [fasilitas];
      if (fasilitasArray.length > 0) {
        filterStage.$match.$and = fasilitasArray.map((facility) => ({
          fasilitas: {
            $elemMatch: {
              nama: facility,
            },
          },
        }));
      }
    }

    if (lokasi && lokasi.trim() !== "") {
      filterStage.$match.alamat = { $regex: lokasi, $options: "i" };
    }

    if (tipe && tipe.trim() !== "") {
      filterStage.$match.tipe_kos = tipe;
    }
    const hargaField =
      tipeHarga === "pertahun" ? "harga_pertahun" : "harga_perbulan";
    if (minHarga || maxHarga) {
      filterStage.$match[hargaField] = {};
      if (minHarga && minHarga.trim() !== "") {
        filterStage.$match[hargaField].$gte = parseInt(minHarga);
      }
      if (maxHarga && maxHarga.trim() !== "") {
        filterStage.$match[hargaField].$lte = parseInt(maxHarga);
      }
    }
    if (rating && rating.trim() !== "") {
      filterStage.$match.avgBintang = parseInt(rating);
    }
    if (Object.keys(filterStage.$match).length > 0) {
      pipeline.push(filterStage);
    }
    if (harga === "termurah") {
      pipeline.push({ $sort: { [hargaField]: 1 } });
    } else if (harga === "termahal") {
      pipeline.push({ $sort: { [hargaField]: -1 } });
    } else if (harga === "rating") {
      pipeline.push({ $sort: { avgBintang: -1 } });
    }
    pipeline.push({ $sort: { id_kos: 1 } });
    const data = await Kos.aggregate(pipeline);
    res.json(data);
  } catch (error) {
    console.error("Filtering error:", error);
    res
      .status(500)
      .json({ message: "Error filtering kos", error: error.message });
  }
};
