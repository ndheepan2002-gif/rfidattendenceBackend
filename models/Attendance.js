const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  loginTime: {
    type: Date,
  },
  logoutTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["PRESENT", "ABSENT"],
    default: "PRESENT",
  },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
