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
  try {
    const { date, fromDate, toDate, status, cls } = req.query;
    const today = new Date().toISOString().split("T")[0];
    let selectedDate = date || fromDate || today;

    let studentQuery = {};

    if (cls && cls !== "All") {
      studentQuery.cls = cls;
    }

    const students = await Student.find(studentQuery).lean();

    for (let s of students) {

      let attendanceQuery = { student: s._id };

      if (fromDate && toDate) {
        attendanceQuery.date = {
          $gte: new Date(selectedDate + "T00:00:00.000Z"),
          $lte: new Date(selectedDate + "T23:59:59.999Z")
        };
      } else if (selectedDate) {
        attendanceQuery.date = selectedDate;
      }

      const attendance = await Attendance.find(attendanceQuery).lean();

      s.attendance = attendance;

      // ✅ FIXED STATUS LOGIC
      if (attendance.length > 0) {
        s.status = attendance[0].status;
        s.loginTime = attendance[0].loginTime;
        s.logoutTime = attendance[0].logoutTime;
      } else {
        s.status = "ABSENT";
        s.loginTime = null;
        s.logoutTime = null;
      }
    }

    // ✅ STATUS FILTER FIX (case-safe)
    if (status && status !== "ALL") {
      return res.json(
        students.filter(
          s => s.status?.toUpperCase() === status.toUpperCase()
        )
      );
    }
    students.forEach(s => {
      // console.log("Student:", s.name, "Status:", s.status);
    });
    res.json(students);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceByStudentID = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    const records = await Attendance.find({
      student: studentId,
    }).sort({ date: 1 });

    if (records.length === 0) {
      return res.json([]);
    }

    // ✅ Helper function to format date
    const formatDate = (date) => {
      const d = new Date(date);
      return (
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0")
      );
    };

    // 🔷 Convert to map (FIXED)
    const recordMap = {};
    records.forEach((r) => {
      const key = formatDate(r.date); // ✅ IMPORTANT FIX
      recordMap[key] = r;
    });

    const startDate = new Date(records[0].date);
    const today = new Date();

    let result = [];

    for (
      let d = new Date(startDate);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const formatted = formatDate(d);

      if (recordMap[formatted]) {
        result.push({
          date: formatted,
          status: recordMap[formatted].status || "PRESENT", // ✅ dynamic
          loginTime: recordMap[formatted].loginTime,
          logoutTime: recordMap[formatted].logoutTime,
        });
      } else {
        result.push({
          date: formatted,
          status: "ABSENT",
          loginTime: null,
          logoutTime: null,
        });
      }
    }

    res.json(result.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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