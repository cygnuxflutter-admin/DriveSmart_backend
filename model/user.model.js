import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  countryCode: {
    type: String,
    required: true,
    trim: true
  },
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: false
  },
  stateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'State',
    required: false
  },
  languageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: false
  },
  deviceToken: {
    type: String,
    required: false,
    trim: true
  },
  firstname: {
    type: String,
    required: false,
    trim: true
  },
  lastname: {
    type: String,
    required: false,
    trim: true
  },
  dob: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: false,
    trim: true
  },
  isProfileFilled: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", userSchema);

export default User;