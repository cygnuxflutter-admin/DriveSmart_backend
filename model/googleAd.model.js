import mongoose from "mongoose";

const googleAdSchema = new mongoose.Schema(
  {
    adName: {
      type: String,
      required: true,
      trim: true,
    },
    adId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    isAdShow: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const GoogleAd = mongoose.model("GoogleAd", googleAdSchema);

export default GoogleAd;
