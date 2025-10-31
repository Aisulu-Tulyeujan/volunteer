// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerHistory = require('../models/VolunteerHistoryUser');
const EventDetails = require('../models/EventDetails');

const sanitizeEvent = (event) => {
  if (!event) return null;
  return {
    _id: event._id,
    eventName: event.eventName,
    description: event.description,
    location: event.location,
    requiredSkills: event.requiredSkills,
    urgency: event.urgency,
    eventDate: event.eventDate,
    neededVolunteers: event.neededVolunteers,
    assignedVolunteers: event.assignedVolunteers,
  };
};

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

const serializeAssignment = (assignment, { includeUser = false } = {}) => ({
  _id: assignment._id,
  userId: assignment.userId?._id || assignment.userId,
  eventId: assignment.eventId?._id || assignment.eventId,
  status: assignment.status,
  matchScore: assignment.matchScore,
  assignedDate: assignment.assignedDate,
  createdAt: assignment.createdAt,
  updatedAt: assignment.updatedAt,
  event: sanitizeEvent(assignment.eventId),
  ...(includeUser ? { user: sanitizeUser(assignment.userId) } : {}),
});

// POST /api/assignments  -> Admin clicks "Match"
router.post('/', async (req, res) => {
  try {
    const { userId, eventId, matchScore = 0 } = req.body;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ error: 'Invalid userId or eventId' });
    }

    const event = await EventDetails.findById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.assignedVolunteers >= event.neededVolunteers) {
      return res.status(409).json({ error: 'Event is already full' });
    }

    const now = new Date();
    const eventDate = event.eventDate ? new Date(event.eventDate) : null;
    const isPastEvent = eventDate && !Number.isNaN(eventDate.getTime()) && eventDate < now;

    // Create assignment (unique on userId+eventId)
    let assignment = await VolunteerAssignment.create({
      userId,
      eventId,
      matchScore,
      status: isPastEvent ? 'Completed' : 'Assigned'
    });

    if (isPastEvent) {
      const participationDate = eventDate || now;
      await VolunteerHistory.findOneAndUpdate(
        { userId, eventId },
        {
          $setOnInsert: {
            userId,
            eventId,
            participationDate
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // bump assigned count
    event.assignedVolunteers = (event.assignedVolunteers || 0) + 1;
    await event.save();

    assignment = await assignment.populate('eventId');

    return res.status(201).json({
      message: 'Volunteer matched successfully',
      assignment: serializeAssignment(assignment)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Volunteer already assigned to this event' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/volunteers/:userId/assignments?tab=upcoming|past
router.get('/volunteers/:userId/assignments', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tab = 'upcoming' } = req.query;
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    const now = new Date();

    const assignments = await VolunteerAssignment.find({ userId })
      .populate('eventId')
      .sort({ assignedDate: -1 });

    const filtered = assignments.filter((assignment) => {
      const event = assignment.eventId;
      if (!event || !event.eventDate) return false;
      const eventDate = new Date(event.eventDate);

      if (tab === 'upcoming') {
        return eventDate >= now && ['Assigned', 'Confirmed'].includes(assignment.status);
      }
      if (tab === 'past') {
        return eventDate < now || assignment.status === 'Completed';
      }
      return true;
    }).sort((a, b) => {
      const aDate = new Date(a.eventId.eventDate);
      const bDate = new Date(b.eventId.eventDate);
      return aDate - bDate;
    });

    res.json(filtered.map((row) => serializeAssignment(row)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/assignments/history -> Admin view of all matches/history
router.get('/history', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const assignments = await VolunteerAssignment.find(query)
      .populate('eventId')
      .populate({ path: 'userId', select: 'name email role' })
      .sort({ assignedDate: -1 });

    res.json(assignments.map((assignment) => serializeAssignment(assignment, { includeUser: true })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/assignments/:id/status  -> volunteer confirms/declines or admin completes
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'Confirmed' | 'Declined' | 'Completed' | 'Cancelled'
    const assignment = await VolunteerAssignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.status = status;
    await assignment.save();

    // If completed, write a history row (idempotent-ish)
    if (status === 'Completed') {
      const existing = await VolunteerHistory.findOne({
        userId: assignment.userId,
        eventId: assignment.eventId
      });
      if (!existing) {
        await VolunteerHistory.create({
          userId: assignment.userId,
          eventId: assignment.eventId,
          participationDate: new Date()
        });
      }
    }

    res.json({ message: 'Status updated', assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
