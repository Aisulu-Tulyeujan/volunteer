const mongoose = require("mongoose");

const EventDetailsSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  requiredSkills: { type: [String], default: [] },
  urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  eventDate: { type: Date, required: true },
  neededVolunteers: { type: Number, default: 1 },       // how many total needed
  assignedVolunteers: { type: Number, default: 0 },     // how many assigned
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EventDetails", EventDetailsSchema);
