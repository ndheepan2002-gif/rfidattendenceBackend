const mongoose = require("mongoose");

const CardLogSchema = new mongoose.Schema({
  card_uid: { type: String, required: true }, // optional: unique
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CardLog", CardLogSchema);
