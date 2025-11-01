import React, { useState, useEffect } from "react";
import "./VolunteerProfile.css";

export default function VolunteerProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipcode: "",
    skills: [],
    preferences: [],
    availability: [],
  });

  const [profileId, setProfileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;
  const userId = auth?.user?._id;

  //  Fetch users profile from backend
  useEffect(() => {
    if (!token || !userId) return;

    fetch(`http://localhost:5050/api/volunteers?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((profiles) => {
        const profile = Array.isArray(profiles)
          ? profiles.find((p) => p.user?._id === userId)
          : null;

        if (profile) {
          setProfileId(profile._id);
          setFormData({
            fullName: profile.fullName,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zipcode: profile.zipcode,
            skills: profile.skills || [],
            preferences: profile.preferences || [],
            availability: profile.availability || [],
          });
        }

        setIsLoading(false);
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, [token, userId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = profileId
      ? `http://localhost:5050/api/volunteers/${profileId}`
      : `http://localhost:5050/api/volunteers`;

    const method = profileId ? "PUT" : "POST";
    const body = profileId ? formData : { ...formData, userId };

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!profileId) setProfileId(data._id);
        alert(profileId ? "Profile updated!" : "Profile created!");
      })
      .catch((err) => console.error("Error saving profile:", err));
  };

  // input handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSkillsChange = (e) =>
    setFormData({
      ...formData,
      skills: Array.from(e.target.selectedOptions, (opt) => opt.value),
    });

  const handleAddDate = (e) => {
    const date = e.target.value;
    if (date && !formData.availability.includes(date)) {
      setFormData({
        ...formData,
        availability: [...formData.availability, date],
      });
    }
  };

  const handleRemoveDate = (date) =>
    setFormData({
      ...formData,
      availability: formData.availability.filter((d) => d !== date),
    });

  if (isLoading) return <p>Loading profile...</p>;

  return (
    <form onSubmit={handleSubmit} className="volunteer-form">
      <h2>Volunteer Profile</h2>
      <label>
        Full Name:
        <input name="fullName" value={formData.fullName} onChange={handleChange} required />
      </label>
      <label>
        Address:
        <input name="address" value={formData.address} onChange={handleChange} required />
      </label>
      <label>
        City:
        <input name="city" value={formData.city} onChange={handleChange} required />
      </label>
      <label>
        State:
        <select name="state" value={formData.state} onChange={handleChange} required>
          <option value="">Select State</option>
          <option value="TX">TX</option>
          <option value="CA">CA</option>
          <option value="NY">NY</option>
        </select>
      </label>
      <label>
        Zipcode:
        <input name="zipcode" value={formData.zipcode} onChange={handleChange} required />
      </label>
      <label>
        Skills:
        <select multiple name="skills" value={formData.skills} onChange={handleSkillsChange}>
          <option value="team work">Team Work</option>
          <option value="driving">Driving</option>
          <option value="photography">Photography</option>
        </select>
      </label>
      <label>
        Preferences:
        <textarea name="preferences" value={formData.preferences} onChange={handleChange} />
      </label>
      <label>
        Availability:
        <input type="date" onChange={handleAddDate} />
      </label>
      <ul>
        {formData.availability.map((date) => (
          <li key={date}>
            {date} <button type="button" onClick={() => handleRemoveDate(date)}>x</button>
          </li>
        ))}
      </ul>
      <button type="submit">Save Profile</button>
    </form>
  );
}
