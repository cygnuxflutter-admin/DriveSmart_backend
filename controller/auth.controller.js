import User from "../model/user.model.js";
import Country from "../model/country.model.js";
import State from "../model/state.model.js";
import Language from "../model/language.model.js";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin (assuming serviceAccountKey.json is in root)
try {
  admin.initializeApp({
    credential: admin.credential.cert("./serviceAccountKey.json"),
  });
  console.log("Firebase Admin initialized successfully");
} catch (firebaseError) {
  console.error("Firebase initialization error:", firebaseError.message);
  console.warn(
    "WARNING: Firebase notifications will not work without serviceAccountKey.json",
  );
}

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const controller = {
  checkUser: async (req, res) => {
    const { countryCode, mobile, deviceToken } = req.body;
    try {
      if (!countryCode || !mobile) {
        return res.status(400).json({
          success: false,
          message: "Country code and mobile number are required"
        });
      }

      const fullMobile = countryCode + mobile;
      const user = await User.findOne({ mobile: fullMobile }).populate('countryId', 'name');

      if (user) {
        if (deviceToken && user.deviceToken !== deviceToken) {
          user.deviceToken = deviceToken;
          await user.save();
        }

        const accessToken = jwt.sign(
          { userId: user._id, mobile: user.mobile },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
          { userId: user._id, mobile: user.mobile },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        return res.status(200).json({
          success: true,
          message: "User found",
          isNewUser: false,
          accessToken,
          refreshToken,
          data: {
            userId: user._id,
            firstname: user.firstname || "",
            lastname: user.lastname || "",
            dob: user.dob || null,
            country: user.countryId || "",
            email: user.email || "",
            mobile: user.mobile || "",
            isProfileFilled: user.isProfileFilled || false
          }
        });
      } else {

        const country = await Country.findOne({ dialingCode: countryCode });
        if (!country) {
          return res.status(404).json({
            success: false,
            message: "Country not found for the provided country code",
          });
        }

        const user = new User({
          mobile: fullMobile,
          countryCode,
          countryId: country._id,
          deviceToken
        });
        await user.save();

        const accessToken = jwt.sign(
          { userId: user._id, mobile: user.mobile },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
          { userId: user._id, mobile: user.mobile },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );

        return res.status(200).json({
          success: true,
          message: "New user",
          isNewUser: true,
          accessToken,
          refreshToken,
          data: {
            userId: user._id,
            firstname: "",
            lastname: "",
            country: {
              _id: country.id,
              name: country.name
            },
            state: "",
            language: "",
            dob: null,
            email: "",
            mobile: fullMobile,
            isProfileFilled: false
          }
        });
      }
    } catch (err) {
      console.error("Error in checkUser:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  sendOTP: async (req, res) => {
    console.log("Request body:", req.body);
    const { mobile, countryCode, deviceToken } = req.body;
    try {
      console.log("Processing OTP request for:", {
        mobile,
        countryCode,
        deviceToken: deviceToken ? "provided" : "not provided",
      });
      if (!mobile || !countryCode) {
        console.log("Missing required fields");
        return res.status(400).json({
          success: false,
          message: "Mobile number and country code are required",
        });
      }

      const fullMobile = countryCode + mobile;
      console.log("Full mobile:", fullMobile);

      // Check if user exists
      let user = await User.findOne({ mobile: fullMobile });
      if (!user) {
        console.log("New user, creating...");
        user = new User({ mobile: fullMobile, countryCode });
      } else {
        console.log("Existing user found");
      }

      // Update deviceToken if provided
      if (deviceToken) {
        user.deviceToken = deviceToken;
        console.log("Device token updated");
      }

      // Generate OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await user.save();
      console.log(`OTP generated and saved: ${otp} for ${fullMobile}`);

      // Associate country if found
      const country = await Country.findOne({ dialingCode: countryCode });
      if (country) {
        user.countryId = country._id;
        await user.save();
        console.log("Country associated:", country.name);
      } else {
        console.log("Country not found for dialing code:", countryCode);
      }

      // Send OTP via Firebase Notification
      if (user.deviceToken) {
        const message = {
          notification: {
            title: "OTP Verification",
            body: `Your OTP is ${otp}`,
          },
          token: user.deviceToken,
        };
        console.log("Attempting to send Firebase message...");
        try {
          await admin.messaging().send(message);
          console.log(`✓ OTP sent via FCM to ${fullMobile}: ${otp}`);
        } catch (fcmError) {
          console.warn(
            `! FCM send failed (but OTP saved): ${fcmError.message}`,
          );
          console.warn(`  OTP saved locally: ${otp}`);
        }
      } else {
        console.log(
          `⚠ No deviceToken for ${fullMobile}, OTP saved locally: ${otp}`,
        );
      }

      console.log("Sending success response");
      res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
      console.error("\n❌ ERROR in sendOTP:", err);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      res.status(500).json({ success: false, message: err.message });
    }
    console.log("========== sendOTP API Completed ==========");
  },

  verifyOTP: async (req, res) => {
    const { mobile, countryCode, otp } = req.body;
    try {
      if (!mobile || !countryCode || !otp) {
        return res.status(400).json({
          success: false,
          message: "Mobile, country code, and OTP are required",
        });
      }

      const fullMobile = countryCode + mobile;
      const user = await User.findOne({ mobile: fullMobile });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (user.otp !== otp || user.otpExpiry < new Date()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired OTP" });
      }

      const country = await Country.findOne({ dialingCode: countryCode });
      if (!country) {
        return res.status(404).json({
          success: false,
          message: "Country not found for the provided country code",
        });
      }
      if (country && !user.countryId) {
        user.countryId = country._id;
      }

      // OTP verified
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.isVerified = true;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, mobile: user.mobile },
        process.env.JWT_SECRET,
        { expiresIn: "365d" },
      );

      if (user.languageId) {
        const language = await Language.findById(user.languageId);
        if (!language) {
          return res
            .status(404)
            .json({ success: false, message: "Language not found" });
        }
        user.languageName = language.language;
      }

      res.status(200).json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          id: user._id,
          mobile: user.mobile,
          countryCode: user.countryCode,
          countryId: user.countryId || null,
          countryName: country ? country.name : null,
          languageName: user.languageName || null,
          stateId: user.stateId || null,
          languageId: user.languageId || null,
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { firstname, lastname, dob, email } = req.body;
      const userId = req.user._id;

      console.log("req.user === ", req.user._id);
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (firstname !== undefined) user.firstname = firstname;
      if (lastname !== undefined) user.lastname = lastname;
      if (dob !== undefined) user.dob = dob;
      if (email !== undefined) user.email = email;

      user.isProfileFilled = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: {
          userId: user._id,
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          dob: user.dob || null,
          email: user.email || "",
          mobile: user.mobile || "",
          countryId: user.countryId || null,
          stateId: user.stateId || null,
          languageId: user.languageId || null,
          isProfileFilled: user.isProfileFilled
        }
      });
    } catch (err) {
      console.error("Error in updateProfile:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  updateUserSelection: async (req, res) => {
    const { userId, stateId, languageId } = req.body;
    try {
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      if (!stateId && !languageId) {
        return res.status(400).json({
          success: false,
          message: "At least stateId or languageId is required",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Validate state if provided
      if (stateId) {
        const state = await State.findById(stateId);
        if (!state) {
          return res
            .status(404)
            .json({ success: false, message: "State not found" });
        }
        user.stateId = stateId;
      }

      // Validate language if provided
      if (languageId) {
        const language = await Language.findById(languageId);
        if (!language) {
          return res
            .status(404)
            .json({ success: false, message: "Language not found" });
        }
        user.languageId = languageId;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "User selection updated successfully",
        user: {
          id: user._id,
          mobile: user.mobile,
          countryCode: user.countryCode,
          countryId: user.countryId || null,
          stateId: user.stateId || null,
          languageId: user.languageId || null,
          isVerified: user.isVerified,
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: "Refresh token is required" });
      }

      const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, secret);
      } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      }

      const userId = decoded.userId;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { userId: user._id, mobile: user.mobile },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const newRefreshToken = jwt.sign(
        { userId: user._id, mobile: user.mobile },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });

    } catch (err) {
      console.error("Error in refreshToken API:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};

export default controller;
