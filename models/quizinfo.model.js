const mongoose = require("mongoose");

const quizInfo = new mongoose.Schema(
  {
    quizTitle: { type: String, required: true },
    quizDescription: { type: String },
    questionTime: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    participants: [
      {
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        score: {
          type: String,
        },
      },
    ],
    email: { type: String, required: true },
  },
  {
    collection: "quiz-data",
  }
);

const quizData = mongoose.model("Quiz-Data", quizInfo);
module.exports = quizData;
