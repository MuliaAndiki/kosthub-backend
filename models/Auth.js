import mongoose from "mongoose";

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
  },
  alamat: {
    type: String,
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
});

export default mongoose.model("Auth", AuthSchema);
