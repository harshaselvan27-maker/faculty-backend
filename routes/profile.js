import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ==============================
// GET PROFILE
// GET /profile/:id
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("GET Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ==============================
// UPDATE PROFILE
// PUT /profile/:id   ✅ THIS WAS MISSING / BROKEN
// ==============================
router.put("/:id", async (req, res) => {
  try {
    const { name, department, phone, photo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        department,
        phone,
        photo,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("PUT Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

export default router;
