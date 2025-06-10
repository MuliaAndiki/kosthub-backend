import mongoose from "mongoose";
import { BankConstants } from "../constants/bank.js";

const ReservaseSchema = new mongoose.Schema(
  {
    nama: { type: String },
    tanggal_lahir: { type: String },
    nomor_hp: { type: String },
    gender: { type: Boolean },
    email: { type: String },
    metode_pembayaran: {
      type: String,
      enum: BankConstants,
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

export default mongoose.model("Reservase", ReservaseSchema);
