// models/ParentUser.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ParentUserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  // 🔗 Parent → Student relation
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  parentMobile: String,

  role: {
    type: String,
    default: "PARENT",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ MUST include next OR remove it
ParentUserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("ParentUser", ParentUserSchema);
