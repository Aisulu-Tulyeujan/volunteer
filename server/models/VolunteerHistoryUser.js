// models/VolunteerHistoryUser.js
const mongoose = require('mongoose');

const VolunteerHistoryUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCredentials', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDetails', required: true },
  participationDate: { type: Date, default: Date.now },
}, { timestamps: true });

VolunteerHistoryUserSchema.index({ userId: 1, eventId: 1 });

module.exports = mongoose.model('VolunteerHistoryUser', VolunteerHistoryUserSchema);
