const mongoose = require("mongoose");

const answers = new mongoose.Schema(
  {
    questions: [
      {
        type: String,
        required: true,
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
    code: {
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
