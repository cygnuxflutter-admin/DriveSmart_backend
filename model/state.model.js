import mongoose from "mongoose";

const stateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stateCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const State = mongoose.model("State", stateSchema);

export default State;