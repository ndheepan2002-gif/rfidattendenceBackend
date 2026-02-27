const Student = require("../models/Student");
const { sendSMS } = require("../utils/sendSMS");
const ParentUser = require("../models/ParentUser");

/* ===============================
   ADD STUDENT
   =============================== */
exports.addStudent = async (req, res) => {
    try {
        const cardNo = req.body?.cardNo?.trim().toUpperCase();
        const parentMobile = req.body?.parentMobile?.trim();

        if (!cardNo) {
            return res.status(400).json({
                success: false,
                message: "cardNo required",
            });
        }

        if (!parentMobile || parentMobile.length !== 10) {
            return res.status(400).json({
                success: false,
                message: "Valid parent mobile number required",
            });
        }

        // 🔍 Check existing card
        const existingStudent = await Student.findOne({ cardNo });
        if (existingStudent) {
            return res.json({
                success: false,
                message: "⚠ Card already registered",
                data: existingStudent,
            });
        }

        // 1️⃣ Create student
        const student = new Student({
            ...req.body,
            cardNo,
            image: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await student.save();

        // 2️⃣ Create parent login
        // 2️⃣ Generate parent login
        const username = `P${req.body.parentMobile}`;
        const defaultPassword = req.body.parentMobile.slice(-6);

        // 🔍 Check if parent already exists
        let parentUser = await ParentUser.findOne({
            $or: [
                { username },
                { parentMobile: req.body.parentMobile }
            ]
        });

        if (!parentUser) {
            // Create only if not exists
            parentUser = new ParentUser({
                username,
                password: defaultPassword,
                parentMobile: req.body.parentMobile,
                student: student._id,
            });

            await parentUser.save();
        }

        // 3️⃣ Link parent to student
        student.parentUser = parentUser._id;
        await student.save();

        // 4️⃣ Send SMS
        const smsText =
            `The Standard Fireworks Rajaratnam college for women Sivakasi\n` +
            `Login Details :\n` +
            `Username: ${username}\n` +
            `Password: ${defaultPassword}\n` +
            `Please login and change your password.`;

        await sendSMS(parentMobile, smsText);

        return res.json({
            success: true,
            message: "✅ Student & Parent Login Created",
            data: {
                student,
                parentLogin: {
                    username,
                    password: defaultPassword, // show once only
                },
            },
        });

    } catch (err) {
        console.error("❌ addStudent error:", err);
        return res.status(500).json({
            success: false,
            message: "Error saving student",
            error: err.message,
        });
    }
};


exports.updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const updateData = { ...req.body };

        // If image is uploaded, replace it
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: "Student not found",
            });
        }

        return res.json({
            success: true,
            message: "✅ Student updated successfully",
            data: updatedStudent,
        });
    } catch (err) {
        console.error("❌ updateStudent error:", err);
        return res.status(500).json({
            success: false,
            message: "Error updating student",
            error: err.message,
        });
    }
};

/* ===============================
   GET ALL STUDENTS
   =============================== */
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json({
            success: true,
            data: students,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error fetching students",
        });
    }
};

/* ===============================
   🔥 CHECK CARD (IMPORTANT)
   =============================== */
exports.checkCard = async (req, res) => {
    try {
        const { card_uid } = req.params;
        const normalizedUid = card_uid.trim().toUpperCase();

        const student = await Student.findOne({ cardNo: normalizedUid });

        if (student) {
            return res.json({
                success: false,
                message: "⚠ Card already registered",
                data: student,
            });
        }

        return res.json({
            success: true,
            message: "✅ Card available",
        });

    } catch (err) {
        console.error("❌ checkCard error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
