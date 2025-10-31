// server/models/UserProfile.js
const mongoose = require("mongoose");

const UserProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCredentials",
      required: true,
      unique: true, // one profile per user
    },
    fullName: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    zipcode: { type: String, default: "" },

    // keep these to match your controller usage
    skills: { type: [String], default: [] },
    preferences: { type: [String], default: [] },

    // if you later want richer availability, change to objects with days/times
    availability: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", UserProfileSchema);
