const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const ParentUser = require("../models/ParentUser");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  // 1️⃣ Try Admin
  let user = await AdminUser.findOne({ username });
  let role = "ADMIN";

  // 2️⃣ If not admin, try Parent
  if (!user) {
    user = await ParentUser.findOne({ username });
    role = "PARENT";
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 3️⃣ JWT Token
  const token = jwt.sign(
    {
      userId: user._id,
      role,
      studentId: role === "PARENT" ? user.student : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    success: true,
    token,
    role,
  });
};
