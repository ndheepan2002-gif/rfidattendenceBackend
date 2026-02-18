const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const ParentUser = require("../models/ParentUser");
const jwt = require("jsonwebtoken");

// LOGIN (RFID SCAN / APP LOGIN)
exports.markLogin = async (req, res) => {
  const { studentId } = req.body;
  const today = new Date().toISOString().split("T")[0];

  let record = await Attendance.findOne({ student: studentId, date: today });

  if (!record) {
    record = await Attendance.create({
      student: studentId,
      date: today,
      loginTime: new Date(),
    });
  }

  res.json({ success: true, record });
};

// LOGOUT
exports.markLogout = async (req, res) => {
  const { studentId } = req.body;
  const today = new Date().toISOString().split("T")[0];

  const record = await Attendance.findOne({ student: studentId, date: today });

  if (!record) {
    return res.status(404).json({ message: "Login not found" });
  }

  record.logoutTime = new Date();
  await record.save();

  res.json({ success: true, record });
};

// GET STUDENT ATTENDANCE
exports.getAttendanceByStudent = async (req, res) => {
  const records = await Attendance.find({
    student: req.params.studentId,
  }).sort({ date: -1 });

  res.json(records);
};

exports.getStudentsWithAttendance = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const students = await Student.find().lean();

  for (let s of students) {
    const attendance = await Attendance.findOne({
      student: s._id,
      date: today,
    });

    s.status = attendance ? attendance.status : "ABSENT";
  }

  res.json(students);
};

// 🔹 GET ATTENDANCE FOR LOGGED-IN PARENT
exports.getAttendanceForParent = async (req, res) => {
  try {
    // req.userId should come from auth middleware
    const parent = await ParentUser.findById(req.userId);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const records = await Attendance.find({
      student: parent.student,
    })
      .sort({ date: -1 })
      .select("date status loginTime logoutTime");

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStudentParent = async (req, res) => {
  try {
    const parent = await ParentUser.findById(req.userId).populate("student");

    if (!parent) return res.status(404).json({ message: "Parent not found" });

    const student = parent.student;

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // 1️⃣ Total students
    const totalStudents = await Student.countDocuments();

    // 2️⃣ Students present today
    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const presentToday = await Attendance.countDocuments({
      date: today,
      status: "PRESENT",
    });

    res.json({
      totalStudents,
      presentToday,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};