const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const EventDetails = require('../models/EventDetails');
const UserCredentials = require('../models/UserCredentials');
const UserProfile = require('../models/UserProfile');
const VolunteerAssignment = require('../models/VolunteerAssignment');
const VolunteerHistory = require('../models/VolunteerHistoryUser');

const DEMO_VOL_EMAIL = 'volunteer@example.com';
const DEMO_ADMIN_EMAIL = 'admin@example.com';

const eventsToSeed = [
  {
    eventName: 'Food Drive – Warehouse',
    description: 'Sort and pack donations for local families.',
    location: '123 Community Way, Houston, TX',
    requiredSkills: ['Logistics', 'Teamwork'],
    urgency: 'High',
    eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    neededVolunteers: 3,
  },
  {
    eventName: 'Park Cleanup',
    description: 'Collect trash and plastics around the north lake.',
    location: 'Memorial Park, Houston, TX',
    requiredSkills: ['Environmental Awareness', 'Physical Work'],
    urgency: 'Medium',
    eventDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    neededVolunteers: 5,
  },
];

async function ensureUser({ name, email, role }) {
  let user = await UserCredentials.findOne({ email });
  if (!user) {
    const password = await bcrypt.hash('password123', 10);
    user = await UserCredentials.create({ name, email, password, role });
  }
  return user;
}

async function ensureProfile(user, overrides = {}) {
  let profile = await UserProfile.findOne({ user: user._id });
  if (!profile) {
    profile = await UserProfile.create({
      user: user._id,
      fullName: overrides.fullName || user.name,
      city: overrides.city || 'Houston',
      state: overrides.state || 'TX',
      zipcode: overrides.zipcode || '77002',
      skills: overrides.skills || ['Teamwork'],
      availability: overrides.availability || [],
    });
  }
  return profile;
}

async function ensureEvents() {
  const results = [];
  for (const template of eventsToSeed) {
    const doc = await EventDetails.findOneAndUpdate(
      { eventName: template.eventName },
      template,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    results.push(doc);
  }
  return results;
}

async function ensureAssignments(volunteer, events) {
  if (!events.length) return;

  const [upcoming, past] = events;

  const assigned = await VolunteerAssignment.findOneAndUpdate(
    { userId: volunteer._id, eventId: upcoming._id },
    {
      matchScore: 4,
      status: 'Assigned',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  upcoming.assignedVolunteers = await VolunteerAssignment.countDocuments({ eventId: upcoming._id, status: { $in: ['Assigned', 'Confirmed'] } });
  await upcoming.save();

  const completed = await VolunteerAssignment.findOneAndUpdate(
    { userId: volunteer._id, eventId: past._id },
    {
      matchScore: 5,
      status: 'Completed',
      assignedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  past.assignedVolunteers = await VolunteerAssignment.countDocuments({ eventId: past._id, status: { $in: ['Assigned', 'Confirmed'] } });
  await past.save();

  const history = await VolunteerHistory.findOne({ userId: volunteer._id, eventId: past._id });
  if (!history) {
    await VolunteerHistory.create({
      userId: volunteer._id,
      eventId: past._id,
      participationDate: completed.assignedDate || new Date(),
    });
  }

  return { assigned, completed };
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI missing in server/.env');
  }

  await mongoose.connect(uri);

  const admin = await ensureUser({ name: 'Demo Admin', email: DEMO_ADMIN_EMAIL, role: 'admin' });
  await ensureProfile(admin, { skills: ['Coordination'] });

  const volunteer = await ensureUser({ name: 'Demo Volunteer', email: DEMO_VOL_EMAIL, role: 'volunteer' });
  const volunteerProfile = await ensureProfile(volunteer, {
    skills: ['Teamwork', 'First Aid', 'Logistics'],
    availability: eventsToSeed.map((e) => e.eventDate.toISOString().slice(0, 10)),
  });

  const events = await ensureEvents();
  await ensureAssignments(volunteer, events);

  console.log('Demo data ready.');
  console.log(`Volunteer email: ${DEMO_VOL_EMAIL} / password123`);
  console.log(`Admin email: ${DEMO_ADMIN_EMAIL} / password123`);
  console.log(`Volunteer profile id: ${volunteerProfile._id}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
