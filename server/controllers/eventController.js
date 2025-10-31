const EventDetails = require("../models/EventDetails");

const sanitizeEvent = (doc) => ({
  _id: doc._id,
  eventName: doc.eventName,
  description: doc.description,
  location: doc.location,
  requiredSkills: doc.requiredSkills,
  urgency: doc.urgency,
  eventDate: doc.eventDate,
  neededVolunteers: doc.neededVolunteers,
  assignedVolunteers: doc.assignedVolunteers,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const buildPayload = (body) => {
  const payload = {
    eventName: body.eventName || body.name,
    description: body.description,
    location: body.location,
    requiredSkills: body.requiredSkills || [],
    urgency: body.urgency,
    eventDate: body.eventDate ? new Date(body.eventDate) : undefined,
    neededVolunteers: body.neededVolunteers ?? 1,
  };

  // allow manual override when editing
  if (body.assignedVolunteers != null) {
    payload.assignedVolunteers = body.assignedVolunteers;
  }

  return payload;
};

exports.getEvents = async (req, res) => {
  try {
    const events = await EventDetails.find().sort({ eventDate: 1 });
    res.json(events.map(sanitizeEvent));
  } catch (err) {
    console.error("Failed to fetch events", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await EventDetails.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(sanitizeEvent(event));
  } catch (err) {
    console.error("Failed to fetch event", err);
    res.status(400).json({ error: "Invalid event id" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const payload = buildPayload(req.body);

    if (!payload.eventName || !payload.description || !payload.location || !payload.urgency || !payload.eventDate) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const doc = new EventDetails({
      ...payload,
      assignedVolunteers: req.body.assignedVolunteers || 0,
    });
    await doc.save();
    res.status(201).json(sanitizeEvent(doc));
  } catch (err) {
    console.error("Failed to create event", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const payload = buildPayload(req.body);

    const event = await EventDetails.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    Object.assign(event, payload);
    await event.save();

    res.json(sanitizeEvent(event));
  } catch (err) {
    console.error("Failed to update event", err);
    res.status(400).json({ error: "Failed to update event" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await EventDetails.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Failed to delete event", err);
    res.status(400).json({ error: "Failed to delete event" });
  }
};
