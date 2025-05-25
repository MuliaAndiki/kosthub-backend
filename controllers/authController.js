const Auth = require("../models/Auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../middleware/auth");
const Kos = require("../models/Kos");
const Reservase = require("../models/Reservase");

exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      fullname,
      nomor,
      tanggal_lahir,
      alamat,
      gender,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let realGernder = gender === "Laki" ? true : false;

    if (
      !username ||
      !email ||
      !password ||
      !fullname ||
      !nomor ||
      !tanggal_lahir ||
      !alamat
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await Auth.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const newUser = new Auth({
      username,
      email,
      password: hashedPassword,
      fullname,
      nomor,
      tanggal_lahir: tanggal_lahir || null,
      alamat: alamat || null,
      gender: realGernder,
      token: null,
    });

    await newUser.save();
    res
      .status(201)
      .json({ data: newUser, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Auth.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

exports.changePassword = async (req, res) => {
  verifyToken(req, res, async () => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await Auth.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error changing password", error });
    }
  });
};

exports.updateProfile = async (req, res) => {
  const { username, ...updates } = req.body;

  try {
    const user = await Auth.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (username && username !== user.username) {
      const existingUsername = await Auth.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      user.username = username;
    }

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

exports.saveKos = async (req, res) => {
  const { id_kos } = req.params;

  try {
    const kos = await Kos.findOne({ id_kos });
    if (!kos) {
      return res.status(404).json({ message: "Kos not found" });
    }

    const user = await Auth.findById(req.user.id).populate("savedKos");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.savedKos && user.savedKos.includes(kos._id)) {
      return res.status(400).json({ message: "Kos already saved" });
    }

    user.savedKos = user.savedKos || [];
    user.savedKos.push(kos._id);
    await user.save();

    res
      .status(200)
      .json({ message: "Kos saved successfully", savedKos: user.savedKos });
  } catch (error) {
    console.error("Error saving kos:", error);
    res.status(500).json({ message: "Error saving kos", error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await Auth.findById(req.user.id).populate("savedKos");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch user", error: err.message });
  }
};
