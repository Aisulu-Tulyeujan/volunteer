// Temporary database
let profiles = [];

// helper function for validations
const validateProfile = (profile) => {
  const errors = {};

  if (!profile.fullName || profile.fullName.length < 3) {
    errors.fullName = "Full name is required and must be at least 3 characters.";
  }
  if (!profile.email || !/^\S+@\S+\.\S+$/.test(profile.email)) {
    errors.email = "Valid email is required.";
  }
  if (!profile.address1) {
    errors.address1 = "Address1 is required.";
  }
  if (!profile.city) {
    errors.city = "City is required.";
  }
  if (!profile.state) {
    errors.state = "State is required.";
  }
  if (!profile.zip || !/^\d{5,9}$/.test(profile.zip)) {
    errors.zip = "ZIP code is required and must be 5-9 digits.";
  }
  if (!Array.isArray(profile.skills) || profile.skills.length === 0) {
    errors.skills = "At least one skill is required.";
  }

  return Object.keys(errors).length ? errors : null;
};

// Get all profiles
exports.getProfiles = (req, res) => {
  res.json({ message: "Profiles list", data: profiles });
};

exports.createProfile = (req, res) => {
  const newProfile = req.body;
  const errors = validateProfile(newProfile);

  if (errors) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  profiles.push(newProfile);
  res.status(201).json({ message: "Profile added successfully!", data: newProfile });
};

// update profile
exports.updateProfile = (req, res) => {
  const email = req.params.email;
  const index = profiles.findIndex((p) => p.email === email);

  if (index === -1) {
    return res.status(404).json({ message: "Profile not found" });
  }

  const updatedProfile = req.body;
  const errors = validateProfile(updatedProfile);
  if (errors) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  profiles[index] = updatedProfile;
  res.json({ message: "Profile updated", data: profiles[index] });
};

// delete profile
exports.deleteProfile = (req, res) => {
  const name = req.params.name;
  profiles = profiles.filter((p) => p.fullName !== name);
  res.json({ message: `Profile for ${name} deleted` });
};

//for jests test 
exports.__setProfiles = (newProfiles) => {
  profiles = newProfiles;
};
