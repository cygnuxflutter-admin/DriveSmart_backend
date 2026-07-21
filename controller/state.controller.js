import State from "../model/state.model.js";
import Country from "../model/country.model.js";

const controller = {
  getStates: async (req, res) => {
    const { countryCode } = req.query;
    try {
      if (!countryCode) {
        return res.status(400).json({ success: false, message: "Country code is required" });
      }

      const country = await Country.findOne({ _id: countryCode });
      if (!country) {
        return res.status(404).json({ success: false, message: "Country not found" });
      }

      const states = await State.find({ countryId: country._id }).select("name stateCode");
      res.status(200).json({ success: true, states });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  addState: async (req, res) => {
    const { name, stateCode, countryId } = req.body;
    try {
      if (!name || !stateCode || !countryId) {
        return res.status(400).json({ success: false, message: "Name, state code, and country ID are required" });
      }

      const country = await Country.findById(countryId);
      if (!country) {
        return res.status(404).json({ success: false, message: "Country not found" });
      }

      const existingState = await State.findOne({ $or: [{ name }, { stateCode }] });
      if (existingState) {
        return res.status(400).json({ success: false, message: "State with this name or code already exists" });
      }

      const newState = new State({ name, stateCode: stateCode.toUpperCase(), countryId });
      await newState.save();
      res.status(201).json({ success: true, message: "State added successfully", state: newState });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

export default controller;