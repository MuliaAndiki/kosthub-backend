import jwt from "jsonwebtoken";
import Auth from "../models/Auth.js";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Access denied. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Auth.findById(decoded.id);
    req.user = decoded;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(403).json({
      status: 403,
      message: "Invalid or expired token.",
    });
  }
};
