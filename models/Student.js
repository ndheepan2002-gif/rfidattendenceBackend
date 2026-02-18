const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  cardNo: { type: String, required: true, unique: true },
  name: String,
  roll: String,
  cls: String,

  fatherName: String,
  motherName: String,
  guardianName: String,
  parentMobile: String,
  emergencyMobile: String,
  address: String,
  occupation: String,

  image: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", StudentSchema);
