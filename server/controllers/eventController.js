const { v4: uuidv4 } = require("uuid");

let events = [
  {
    id: uuidv4(),
    name: "Food Drive",
    description: "Collect and distribute food at the community hall.",
    location: "Community Hall",
    requiredSkills: ["Organization", "Teamwork"],
    urgency: "High",
    date: "2025-11-20",
  },
];

const getEvents = (req, res) => {
  res.json(events);
};

const getEventById = (req, res) => {
  const event = events.find((e) => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
};

const createEvent = (req, res) => {
  const { name, description, location, requiredSkills, urgency, date } = req.body;

  if (!name || !description || !location || !requiredSkills || !urgency || !date) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const newEvent = { id: uuidv4(), name, description, location, requiredSkills, urgency, date };
  events.push(newEvent);
  res.status(201).json(newEvent);
};

const updateEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Event not found" });

  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
};

const deleteEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return res.status(404).json({ error: "Event not found" });

  events.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
