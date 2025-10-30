// models/VolunteerAssignment.js
const mongoose = require('mongoose');

const VolunteerAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserCredentials', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventDetails', required: true },
  matchScore: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Assigned', 'Confirmed', 'Declined', 'Completed', 'Cancelled'],
    default: 'Assigned'
  },
  assignedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// One volunteer shouldn’t be assigned to the same event twice
VolunteerAssignmentSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerAssignment', VolunteerAssignmentSchema);
