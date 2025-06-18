import mongoose from "mongoose";
import { INDONESIA_PROVINCES } from "../constants/provinces.js";
const AuthSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  nomor: {
    type: String,
    required: true,
  },
  tanggal_lahir: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    enum: INDONESIA_PROVINCES,
    required: true,
  },
  gender: {
    type: Boolean,
  },
  bio: {
    type: String,
    default: "",
  },
  fotoProfil: {
    type: String,
  },
  savedKos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kos",
    },
  ],
  role: {
    type: String,
    enum: ["default", "user", "owner", "admin"],
    default: "user",
    required: true,
  },
});

export default mongoose.model("Auth", AuthSchema);
