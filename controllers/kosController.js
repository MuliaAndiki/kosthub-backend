const Kos = require("../models/Kos");
const User = require("../models/Auth");
const Reservase = require("../models/Reservase");
const path = require("path");

// GET all
exports.getAllKos = async (req, res) => {
  const data = await Kos.find();
  res.json(data);
};

// GET by ID
exports.getKosById = async (req, res) => {
  const kos = await Kos.findOne({ id_kos: req.params.id });
  kos ? res.json(kos) : res.status(404).json({ message: "Tidak ditemukan" });
};

// PUT
exports.updateKos = async (req, res) => {
  const updated = await Kos.findOneAndUpdate(
    { id_kos: req.params.id },
    req.body,
    { new: true }
  );
  updated
    ? res.json(updated)
    : res.status(404).json({ message: "Tidak ditemukan" });
};

exports.filterKos = async (req, res) => {
  const { fasilitas, minHarga, maxHarga, rating, tipeHarga, harga } = req.query;

  try {
    const pipeline = [];

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

    console.log(`Found ${data.length} kos matching the criteria`);

    res.json(data);
  } catch (error) {
    console.error("Filtering error:", error);
    res.status(500).json({
      message: "Error filtering kos",
      error: error.message,
    });
  }
};
