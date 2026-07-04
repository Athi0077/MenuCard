const express = require("express");
const router = express.Router();
const FcmToken = require("../models/FcmToken");

router.post("/save-token", async (req, res) => {
  const { adminId, token } = req.body;

  try {
    const existing = await FcmToken.findOne({ adminId });

    if (existing) {
      existing.token = token;
      await existing.save();
    } else {
      await FcmToken.create({
        adminId,
        token,
      });
    }

    res.json({
      success: true,
      message: "Token saved",
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
