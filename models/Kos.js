import mongoose from "mongoose";

const KosSchema = new mongoose.Schema({
  id_kos: { type: Number, required: true, unique: true },
  nama_kos: { type: String, required: true },
  alamat: { type: String, required: true },
  fasilitas: [
    {
      nama: { type: String, required: true },
      jumlah: { type: String, required: true },
    },
  ],
  harga_perbulan: { type: Number, required: true },
  harga_pertahun: { type: Number, required: true },
  kontak: {
    email: { type: String, required: true },
    nomor: { type: String, required: true },
  },
  avgBintang: { type: Number, default: 0 },
  image: {
    thumbnail: { type: String, required: true },
    gallery: [{ type: String, required: true }],
  },
  deskripsi: { type: String, default: "" },
  ulasan: [
    {
      nama: { type: String, required: true },
      bintang: { type: Number, required: true },
      komentar: { type: String, required: true },
      tanggal: { type: Date, default: Date.now },
      imageUlasan: [{ type: String, required: true }],
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    required: true,
  },
  id_owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  tipe_kos: {
    type: String,
    enum: ["putra", "putri", "campur"],
    default: "campur",
    required: true,
  },
});

export default mongoose.model("Kos", KosSchema);
