import express from "express";
const router = express.Router();
import Country from "../model/country.model.js";
import Language from "../model/language.model.js";
import State from "../model/state.model.js";
import Question from "../model/question.model.js";
import { get } from "mongoose";

const controller = {
 

  getLanguage: async (req, res) => {
    const { stateCode } = req.query;
    try {
      if (!stateCode) {
        return res.status(400).json({ success: false, message: "State code is required" });
      }

      const state = await State.findOne({ _id : stateCode });
      if (!state) {
        return res.status(404).json({ success: false, message: "State not found" });
      }

      const languages = await Language.find({ stateId: state._id }).select("language");
      res.status(200).json(languages);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  addLanguage: async (req, res) => {
    const { language, stateId } = req.body;
    try {
      if (!language || !stateId) {
        return res.status(400).json({ success: false, message: "Language and state ID are required" });
      }

      const state = await State.findById(stateId);
      if (!state) {
        return res.status(404).json({ success: false, message: "State not found" });
      }

      const existingLanguage = await Language.findOne({ language, stateId });
      if (existingLanguage) {
        return res.status(400).json({ success: false, message: "Language already exists for this state" });
      }

      const newLanguage = new Language({ language, stateId });
      await newLanguage.save();
      res.status(201).json({ success: true, message: "Language added successfully", language: newLanguage });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default controller;