import express from "express";
import Leave from "../models/Leave.js";

const router = express.Router();

// ==============================
// APPLY LEAVE
// POST /leave
// ==============================
router.post("/", async (req, res) => {
  try {
    const { userId, reason, fromDate, toDate } = req.body;

    // 🔴 Validation
    if (!userId || !reason || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const leave = new Leave({
      userId,
      reason,
      fromDate,
      toDate,
    });

    await leave.save();

    res.json({
      success: true,
      message: "Leave applied successfully",
      leave,
    });
  } catch (err) {
    console.error("Apply Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to save leave",
    });
  }
});

// ==============================
// GET LEAVES BY USER
// GET /leave/:userId
// ==============================
router.get("/:userId", async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      leaves,
    });
  } catch (err) {
    console.error("Fetch Leave Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leaves",
    });
  }
});

export default router;
