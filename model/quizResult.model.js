import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    rightAnswer: {
      type: Number,
      required: true,
    },
    wrongAnswer: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    totalExamTime: {
      type: Number,
      required: true,
    },
    startExamTime: {
      type: Date,
      required: true,
    },
    endExamTime: {
      type: Date,
      required: false,
    },
    isPassed: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const QuizResult = mongoose.model("QuizResult", quizResultSchema);

export default QuizResult;
