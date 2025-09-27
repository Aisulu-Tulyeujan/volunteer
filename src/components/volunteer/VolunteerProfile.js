import React, { useState } from "react";
import "./VolunteerProfile.css"; // link your styles

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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSkillsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, skills: selected });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

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

      <button type="submit">Save Profile</button>
    </form>
  );
}

export default VolunteerProfile;
