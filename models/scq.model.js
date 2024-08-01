const mongoose = require("mongoose");

const scqQuestion = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    answer: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
  },
  {
    collection: "quizQuestion/scq",
  }
);

const SCQ = mongoose.model("quizQuestion/scq", scqQuestion);
module.exports = SCQ;
