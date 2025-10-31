const UserProfile = require('../models/UserProfile');
const UserCredentials = require('../models/UserCredentials');

const sanitizeProfile = (doc) => ({
  _id: doc._id,
  userId: doc.user?._id || doc.user,
  fullName: doc.fullName,
  address: doc.address,
  city: doc.city,
  state: doc.state,
  zipcode: doc.zipcode,
  skills: doc.skills || [],
  preferences: doc.preferences || [],
  availability: doc.availability || [],
  user: doc.user && doc.user.name ? {
    _id: doc.user._id,
    name: doc.user.name,
    email: doc.user.email,
    role: doc.user.role,
  } : undefined,
});

exports.getProfiles = async (req, res) => {
  try {
    const { role, email } = req.query;
    const profiles = await UserProfile.find()
      .populate({ path: 'user', select: 'name email role' })
      .sort({ createdAt: -1 });

    const filtered = profiles.filter((p) => {
      if (role && p.user?.role !== role) return false;
      if (email && p.user?.email !== email) return false;
      return true;
    });

    res.json(filtered.map((profile) => sanitizeProfile(profile)));
  } catch (err) {
    console.error('Failed to load profiles', err);
    res.status(500).json({ error: 'Failed to load profiles' });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const { userId, email, ...rest } = req.body;

    let user = null;
    if (userId) {
      user = await UserCredentials.findById(userId);
    } else if (email) {
      user = await UserCredentials.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ error: 'Associated user not found' });
    }

    const existing = await UserProfile.findOne({ user: user._id });
    if (existing) {
      return res.status(409).json({ error: 'Profile already exists for this user' });
    }

    const profile = new UserProfile({
      user: user._id,
      fullName: rest.fullName || user.name,
      address: rest.address || '',
      city: rest.city || '',
      state: rest.state || '',
      zipcode: rest.zipcode || '',
      skills: rest.skills || [],
      preferences: rest.preferences || [],
      availability: rest.availability || [],
    });

    await profile.save();
    const populated = await profile.populate({ path: 'user', select: 'name email role' });
    res.status(201).json(sanitizeProfile(populated));
  } catch (err) {
    console.error('Failed to create profile', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await UserProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const payload = {
      fullName: req.body.fullName ?? profile.fullName,
      address: req.body.address ?? profile.address,
      city: req.body.city ?? profile.city,
      state: req.body.state ?? profile.state,
      zipcode: req.body.zipcode ?? profile.zipcode,
      skills: req.body.skills ?? profile.skills,
      preferences: req.body.preferences ?? profile.preferences,
      availability: req.body.availability ?? profile.availability,
    };

    Object.assign(profile, payload);
    await profile.save();

    const populated = await profile.populate({ path: 'user', select: 'name email role' });
    res.json(sanitizeProfile(populated));
  } catch (err) {
    console.error('Failed to update profile', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await UserProfile.findByIdAndDelete(id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    console.error('Failed to delete profile', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};
