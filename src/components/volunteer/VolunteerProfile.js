import React, { useState } from "react";
import "./VolunteerProfile.css";

function VolunteerProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    skills: [],
    preferences: "",
    availability: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, skills: selected });
  };

  const handleAddDate = (e) => {
    const date = e.target.value;
    if (date && !formData.availability.includes(date)) {
      setFormData({
        ...formData,
        availability: [...formData.availability, date],
      });
    }
  };

  const handleRemoveDate = (date) => {
    setFormData({
      ...formData,
      availability: formData.availability.filter((d) => d !== date),
    });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  // Load existing volunteers (or empty array)
  const volunteers = JSON.parse(localStorage.getItem("volunteers")) || [];

  // Add the new one (or update existing one)
  volunteers.push(formData);

  // Save back to localStorage
  localStorage.setItem("volunteers", JSON.stringify(volunteers));

  console.log("Profile saved:", formData);
  alert("Profile saved successfully!");
};

  return (
    <form onSubmit={handleSubmit} className="volunteer-form">
      <label>
        Full Name:
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          maxLength="50"
          required
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Address 1:
        <input
          type="text"
          name="address1"
          value={formData.address1}
          maxLength="100"
          required
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Address 2:
        <input
          type="text"
          name="address2"
          value={formData.address2}
          maxLength="100"
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        City:
        <input
          type="text"
          name="city"
          value={formData.city}
          maxLength="100"
          required
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        State:
        <select
          name="state"
          value={formData.state}
          required
          onChange={handleChange}
        >
          <option value="">Select a state</option>
          <option value="TX">TX</option>
          <option value="CA">CA</option>
          <option value="NY">NY</option>
          <option value="FL">FL</option>
          <option value="AZ">AZ</option>
        </select>
      </label>
      <br />

      <label>
        Zip Code:
        <input
          type="text"
          name="zip"
          value={formData.zip}
          pattern="[0-9]{5,9}"
          required
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Skills:
        <select
          name="skills"
          multiple
          value={formData.skills}
          onChange={handleSkillsChange}
          required
        >
          <option value="team work">Team Work</option>
          <option value="driving">Driving</option>
          <option value="photography">Photography</option>
          <option value="gardening">Gardening</option>
          <option value="leadership">Leadership</option>
          <option value="public speaking">Public Speaking</option>
        </select>
      </label>
      <br />

      <label>
        Preferences:
        <textarea
          name="preferences"
          value={formData.preferences}
          onChange={handleChange}
        />
      </label>
      <br />

      <label>
        Availability (Select multiple dates):
        <input type="date" onChange={handleAddDate} />
      </label>

      <div className="selected-dates">
        {formData.availability.length > 0 ? (
          <ul>
            {formData.availability.map((date, index) => (
              <li key={index}>
                {date}
                <button
                  type="button"
                  onClick={() => handleRemoveDate(date)}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No dates selected yet.</p>
        )}
      </div>
      <br />

      <button type="submit">Save Profile</button>
    </form>
  );
}

export default VolunteerProfile;
