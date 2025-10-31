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

const isProvided = (v) => v !== undefined && v !== null && v !== "";

const normalizeSkills = (val) => {
  if (!isProvided(val)) return undefined;
  if (Array.isArray(val)) return val;
  return String(val)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const buildPayload = (body) => {
  const payload = {};

  if (isProvided(body.eventName) || isProvided(body.name)) {
    payload.eventName = body.eventName || body.name;
  }
  if (isProvided(body.description)) payload.description = body.description;
  if (isProvided(body.location)) payload.location = body.location;

  const skills = normalizeSkills(body.requiredSkills);
  if (isProvided(skills)) payload.requiredSkills = skills;

  if (isProvided(body.urgency)) payload.urgency = body.urgency;

  if (isProvided(body.eventDate)) {
    const d = new Date(body.eventDate);
    if (!isNaN(d.getTime())) payload.eventDate = d;
  }

  if (isProvided(body.neededVolunteers)) payload.neededVolunteers = body.neededVolunteers;
  if (isProvided(body.assignedVolunteers)) payload.assignedVolunteers = body.assignedVolunteers;

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

    Object.entries(payload).forEach(([k, v]) => {
      event.set(k, v);
    });

    await event.save();

    return res.json(sanitizeEvent(event));
  } catch (err) {
    console.error("Failed to update event:", err?.name, err?.message, err?.errors);
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
