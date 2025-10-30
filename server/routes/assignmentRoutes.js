// routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerHistory = require('../models/VolunteerHistoryUser');
const EventDetails = require('../models/EventDetails'); // ensure this exists

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

    // Create assignment (unique on userId+eventId)
    const assignment = await VolunteerAssignment.create({
      userId, eventId, matchScore, status: 'Assigned'
    });

    // bump assigned count
    event.assignedVolunteers = (event.assignedVolunteers || 0) + 1;
    await event.save();

    return res.status(201).json({ message: 'Volunteer matched successfully', assignment });
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

    const now = new Date();

    // Join with EventDetails so we can return all event fields + status
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'eventdetails', // collection name for EventDetails (check your actual)
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' }
    ];

    if (tab === 'upcoming') {
      pipeline.push({
        $match: {
          'event.eventDate': { $gte: now },
          status: { $in: ['Assigned', 'Confirmed'] }
        }
      });
    } else if (tab === 'past') {
      pipeline.push({
        $match: {
          $or: [
            { 'event.eventDate': { $lt: now } },
            { status: 'Completed' }
          ]
        }
      });
    }

    pipeline.push({ $sort: { 'event.eventDate': 1 } });

    const rows = await VolunteerAssignment.aggregate(pipeline);
    res.json(rows);
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
