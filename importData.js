const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Kos = require("./models/Kos");
const data = require("./data/kos_final_fix.json");

dotenv.config(); // Load .env file

// Connect ke MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB Atlas ✅");

    // Optional: Bersihkan dulu semua data
    await Kos.deleteMany();

    // Insert data dari file JSON
    await Kos.insertMany(data);
    console.log("Data dummy berhasil di-import 🎉");

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Gagal konek MongoDB:", err);
  });
