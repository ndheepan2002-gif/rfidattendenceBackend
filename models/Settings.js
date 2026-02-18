const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  loginTime: {
    type: String,
    required: true,
  },
  logoutTime: {
    type: String,
    required: true,
  },
  autoLocation: {
    type: Boolean,
    default: true,
  },
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
  updatedBy: {
    type: String,
    default: "ADMIN",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Settings", SettingsSchema);
