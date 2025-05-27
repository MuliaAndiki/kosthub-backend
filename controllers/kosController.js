import Kos from "../models/Kos.js";
import User from "../models/Auth.js";
import Reservase from "../models/Reservase.js";
import path from "path";

// GET all
export const getAllKos = async (req, res) => {
  try {
    const data = await Kos.find();
    res.json(data);
  } catch (error) {
    console.error("Error fetching all kos:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch kos", error: error.message });
  }
};

// GET by ID
export const getKosById = async (req, res) => {
  try {
    const kos = await Kos.findOne({ id_kos: req.params.id });
    kos ? res.json(kos) : res.status(404).json({ message: "Tidak ditemukan" });
  } catch (error) {
    console.error("Error fetching kos by ID:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch kos", error: error.message });
  }
};

// PUT
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

export const filterKos = async (req, res) => {
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
