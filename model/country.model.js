import mongoose from "mongoose";

const countrySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    countryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      minlength: 2,
      error: "Country code must be at least 2 characters long and uppercase",
    },
    dialingCode: {
      type: String,
      required: true,
      unique: true,
    },
    flag: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

const Country = mongoose.model("Country", countrySchema);

export default Country;
