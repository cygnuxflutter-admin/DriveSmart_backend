import mongoose from "mongoose";

const languageSchema = mongoose.Schema(
  {
    language: {
      type: String,
      required: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Language = mongoose.model("Language", languageSchema);

export default Language;
