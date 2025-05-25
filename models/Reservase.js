const mongoose = require("mongoose");

const Reservase = new mongoose.Schema(
  {
    nama: { type: String },
    tanggal_lahir: { type: String },
    nomor_hp: { type: String },
    gender: { type: Boolean },
    email: { type: String },
    metode_pembayaran: {
      type: String,
      enum: [
        "Bank Syariah Indonesia",
        "Bank Mandiri",
        "Bank Negara Indonesia",
        "Bank Tabungan Negara",
        "Bank Central Asia",
        "Bank Aceh Syariah",
      ],
    },
    kontrak: { type: String },
    bukti_pembayaran: { type: String },
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      require: true,
    },
    id_kos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kos",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservase", Reservase);
