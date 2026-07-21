import express from "express";
const router = express.Router();
import Country from "../model/country.model.js";
import Language from "../model/language.model.js";
import State from "../model/state.model.js";
import Question from "../model/question.model.js";
import { get } from "mongoose";

const controller = {
  getCountry: async (req, res) => {
    try {
      const countries = await Country.find().select("name");
      res.status(200).json(countries);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  addCountry: async (req, res) => {
    const { name, countryCode, dialingCode, flag } = req.body;
    try {
      if (!name || !countryCode || !dialingCode || !flag) {
        return res.status(400).json({ success: false, message: "Name, country code, dialing code, and flag are required" });
      }

      const existingCountry = await Country.findOne({ $or: [{ name }, { countryCode }, { dialingCode }] });
      if (existingCountry) {
        return res.status(400).json({ success: false, message: "Country with this name, code, or dialing code already exists" });
      }

      const newCountry = new Country({ name, countryCode: countryCode.toUpperCase(), dialingCode, flag });
      await newCountry.save();
      res.status(201).json({ success: true, message: "Country added successfully", country: newCountry });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default controller;