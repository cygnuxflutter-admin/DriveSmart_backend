import mongoose from "mongoose";

const questionSchema = mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      unique: true,
      
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    options:{
      type:Array,
      required:true,
    },
    answer:{
      type:Number,
      required:true,
    }
  },
  {
    timestamps: true,
  },
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
