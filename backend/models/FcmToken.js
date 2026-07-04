const mongoose = require("mongoose");

const fcmTokenSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  token: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("FcmToken", fcmTokenSchema);
