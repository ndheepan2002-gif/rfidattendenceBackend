const router = require("express").Router();
const {
  markLogin,
  markLogout,
  getAttendanceByStudent,
  getStudentsWithAttendance,
  getAttendanceForParent,
  getStudentParent,
  getDashboardStats
} = require("../controllers/attendance.controller");
const auth = require("../middleware/auth.middleware"); 

router.post("/login", markLogin);
router.post("/logout", markLogout);
router.get("/students", getStudentsWithAttendance);
router.get("/parent", auth, getAttendanceForParent);
router.get("/student-parent", auth, getStudentParent);
router.get("/stats", getDashboardStats);
router.get("/:studentId", getAttendanceByStudent);


module.exports = router;
