import QuizResult from "../model/quizResult.model.js";
import mongoose from "mongoose";



export const addQuizResult = async (req, res) => {
  try {
    const { languageId, rightAnswer, wrongAnswer, totalQuestions, totalExamTime, startExamTime, isPassed } = req.body;

    const validationErrors = [];


    const parseNumberField = (value, fieldName) => {
      if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
        validationErrors.push({ field: fieldName, message: `Please provide ${fieldName}.` });
        return null;
      }

      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        validationErrors.push({ field: fieldName, message: `Please enter a number for ${fieldName}.` });
        return null;
      }

      return parsed;
    };

    const rightAnswerNum = parseNumberField(rightAnswer, "rightAnswer");
    const wrongAnswerNum = parseNumberField(wrongAnswer, "wrongAnswer");
    const totalQuestionsNum = parseNumberField(totalQuestions, "totalQuestions");
    const totalExamTimeNum = parseNumberField(totalExamTime, "totalExamTime");

    let startExamDate = null;
    if (!startExamTime || (typeof startExamTime === "string" && startExamTime.trim() === "")) {
      validationErrors.push({ field: "startExamTime", message: "Please provide startExamTime." });
    } else {
      startExamDate = new Date(startExamTime);
      if (Number.isNaN(startExamDate.getTime())) {
        validationErrors.push({ field: "startExamTime", message: "Please provide a valid date for startExamTime." });
      }
    }

    if (isPassed !== undefined && typeof isPassed !== "boolean") {
      validationErrors.push({ field: "isPassed", message: "Please provide a boolean for isPassed." });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: validationErrors,
      });
    }

    const quizResult = new QuizResult({
      userId: req.user.id,
      languageId: languageId,
      rightAnswer: rightAnswerNum,
      wrongAnswer: wrongAnswerNum,
      totalQuestions: totalQuestionsNum,
      totalExamTime: totalExamTimeNum,
      startExamTime: startExamTime,
      endExamTime: new Date(),
      isPassed: typeof isPassed === "boolean" ? isPassed : false,
    });

    await quizResult.save();

    return res.status(201).json({
      success: true,
      message: "Quiz result added successfully",
      data: quizResult,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({ field: err.path, message: err.message }));
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error adding quiz result",
      error: error.message,
    });
  }
};

export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log("Fetching quiz history for userId:", userId);

    const results = await QuizResult.find({ userId })
      .sort({ createdAt: -1 });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quiz history found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz history fetched successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching quiz history",
      error: error.message,
    });
  }
};

export const getUserQuizResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const results = await QuizResult.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Quiz results fetched successfully",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching quiz results",
      error: error.message,
    });
  }
};

export const getUserQuizStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all quiz results for the user
    const results = await QuizResult.find({ userId });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No quiz results found",
        data: {
          totalExams: 0,
          totalCorrect: 0,
          totalWrong: 0,
          averagePercentage: 0,
          totalTimeSpent: 0,
        },
      });
    }

    // Calculate statistics
    const totalExams = results.length;
    const totalCorrect = results.reduce((sum, result) => sum + result.rightAnswer, 0);
    const totalWrong = results.reduce((sum, result) => sum + result.wrongAnswer, 0);
    const totalTimeSpent = results.reduce((sum, result) => sum + result.totalExamTime, 0);
    const averagePercentage = (results.reduce((sum, result) => sum + parseFloat(result.percentage), 0) / totalExams).toFixed(2);

    return res.status(200).json({
      success: true,
      message: "User statistics fetched successfully",
      data: {
        totalExams,
        totalCorrect,
        totalWrong,
        averagePercentage,
        totalTimeSpent,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    });
  }
};

export const getQuizResultById = async (req, res) => {
  try {
    const { resultId } = req.params;

    const result = await QuizResult.findById(resultId)
      .populate("userId", "mobile countryCode");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Quiz result not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz result fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching quiz result",
      error: error.message,
    });
  }
};
