const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const upload = require("../middleware/upload");

// ADD STUDENT (multipart)
router.post(
  "/add",
  upload.single("image"), // 👈 IMPORTANT
  studentController.addStudent
);

router.put(
  "/update/:id", // student _id
  upload.single("image"),
  studentController.updateStudent
);

// GET STUDENTS
router.get("/", studentController.getStudents);

// CHECK CARD
router.get("/check-card/:card_uid", studentController.checkCard);

module.exports = router;
