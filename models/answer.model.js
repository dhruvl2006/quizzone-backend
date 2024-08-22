const mongoose = require("mongoose");

const answers = new mongoose.Schema(
  {
    questions: [
      {
        answer: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true,
        },
        options: {
          type: Array,
          required: true,
        },
        question: {
          type: String,
          required: true,
        },
        solution: {
          type: String,
        },
        _id: {
          type: String,
          required: true,
        },
      },
    ],
    userAnswers: [
      {
        type: String,
        required: true,
      },
    ],
    score: {
      type: String,
      required: true,
    },
    testcode: {
      type: String,
      required: true,
    },
    user: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    time: {
      type: String,
      required: true,
    },
    quizTitle: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
  },
  {
    collection: "answers",
  }
);

const Answers = mongoose.model("answers", answers);
module.exports = Answers;
