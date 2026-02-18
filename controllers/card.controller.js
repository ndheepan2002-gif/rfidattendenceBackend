const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const ParentUser = require("../models/ParentUser");
const { sendSMS } = require("../utils/sendSMS");

exports.readCard = async (req, res) => {
  try {
    const { card_uid } = req.body;

    if (!card_uid) {
      return res.status(400).json({ success: false });
    }

    const io = req.app.get("io");

    // 🔥 Check if any socket is in addcard mode
    const sockets = await io.fetchSockets();
    const addCardSocket = sockets.find(
      (socket) => socket.mode === "addcard"
    );

    // ==========================================
    // 🔥 IF ADD CARD MODE ACTIVE → USE SOCKET
    // ==========================================
    if (addCardSocket) {

      const existingStudent = await Student.findOne({ cardNo: card_uid });

      addCardSocket.emit("cardDetected", {
        card_uid,
        alreadyExists: !!existingStudent,
        mode: "addcard"
      });

      return res.json({ success: true });
    }

    // ==========================================
    // 🔥 OTHERWISE → NORMAL ATTENDANCE (NO SOCKET)
    // ==========================================

    const student = await Student.findOne({ cardNo: card_uid });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // 🔥 Fetch parent using student ID
    const parent = await ParentUser.findOne({ student: student._id });

    const today = new Date().toISOString().split("T")[0];

    let attendance = await Attendance.findOne({
      student: student._id,
      date: today
    });

    // Helper function
    const formatTime = (date) => {
      return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    };

    // ================= LOGIN =================
    if (!attendance) {

      attendance = await Attendance.create({
        student: student._id,
        date: today,
        loginTime: new Date(),
        status: "PRESENT"
      });
      console.log("Parrent",parent);
      // 🔥 SEND SMS
      if (parent?.parentMobile) {

        const smsText =
          `Ayya Nadar Janaki Ammal College\n\n` +
          `Student: ${student.name}\n` +
          `Department: ${student.cls}\n` +
          `Status: LOGIN\n` +
          `Time: ${formatTime(attendance.loginTime)}`;

        await sendSMS(parent.parentMobile, smsText);
      }

      return res.json({
        success: true,
        type: "LOGIN",
        studentName: student.name,
        time: attendance.loginTime
      });
    }

    // ================= LOGOUT =================
    if (!attendance.logoutTime) {

      attendance.logoutTime = new Date();
      await attendance.save();

      // 🔥 SEND SMS
      if (parent?.parentMobile) {

        const smsText =
          `Ayya Nadar Janaki Ammal College\n\n` +
          `Student: ${student.name}\n` +
          `Department: ${student.cls}\n` +
          `Status: LOGOUT\n` +
          `Time: ${formatTime(attendance.logoutTime)}`;

        await sendSMS(parent.parentMobile, smsText);
      }

      return res.json({
        success: true,
        type: "LOGOUT",
        studentName: student.name,
        time: attendance.logoutTime
      });
    }



    // Already logged in and out
    return res.json({
      success: false,
      message: "Attendance already completed for today"
    });

  } catch (err) {
    console.error("❌ readCard error:", err);
    res.status(500).json({ success: false });
  }
};
