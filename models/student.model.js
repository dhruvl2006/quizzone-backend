const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentname: { type: String, required: true },
    studentemail: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  {
    collection: "student-data",
  }
);

const Student = mongoose.model("StudentData", studentSchema);
module.exports = Student;
