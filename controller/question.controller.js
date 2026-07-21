import express from "express";
const router = express.Router();
import User from "../model/user.model.js";
import Country from "../model/country.model.js";
import Language from "../model/language.model.js";
import State from "../model/state.model.js";
import Question from "../model/question.model.js";
import { get } from "mongoose";

const controller = {


  getQuestions: async (req, res) => {
    try {
    
      const { stateId, languageId } = req.query;

      console.log("User details - stateId:", stateId, "languageId:", languageId);

      if (!stateId || !languageId) {
        return res.status(400).json({ success: false, message: "User has not selected state and language yet" });
      }

      // console.log("Fetching questions for user:", user._id, "with stateId:", stateId, "and languageId:", languageId);
      const questions = await Question.find({ stateId, languageId }).select("question options answer");
      if (questions.length === 0) {
        return res.status(200).json({ success: true, message: "No questions found for the user's selected state and language" });
      }
      res.status(200).json({ success: true, questions, count: questions.length });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  addQuestion: async (req, res) => {
    const { stateId, languageId, question, options, answer } = req.body;
    try {
      if(!stateId || !languageId || !question || !options || answer === undefined ){
        return res.status(400).json({ "success" : false , "message": "stateId, languageId, question, options and answer are required in the request body" });
      }
      if(!Array.isArray(options) || options.length !== 4){
        return res.status(400).json({ "success" : false , "message": "options must be an array with  4 options" });
      }
      if(options.some(opt => typeof opt === "string" && opt.trim() === "")){
        return res.status(400).json({ "success" : false , "message": "options cannot be empty strings" });
      }
      const newQuestion = new Question({ stateId, languageId, question, options, answer });
      await newQuestion.save();
      res.status(201).json({ "success" : true , "message": "Question added successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

};

export default controller;