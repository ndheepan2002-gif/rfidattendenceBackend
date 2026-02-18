const Student = require("../models/Student");

exports.getMyChildren = async (req, res) => {
  const students = await Student.find({
    parentUser: req.user.userId,
  });

  res.json(students);
};
