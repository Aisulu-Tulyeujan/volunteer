import React from "react";
import "./VolunteerMatch.css";

export default function VolunteerMatch() {
  const volunteerNames = ["Aisulu", "Rana", "Noelanie", "Minh"];
  const eventNames = ["Food Drive", "Beach Cleanup", "Tree Planting", "Animal Shelter Support"];

  return (
    <div className="volunteer-match">
      <header>
        <h2>Volunteer Matching</h2>
      </header>

      <main>
        {volunteerNames.map((volunteer, i) => (
          <div className="match-card" key={i}>
            <h3>{volunteer}</h3>
            <select className="event-select">
              {eventNames.map((event, j) => (
                <option key={j} value={event}>{event}</option>
              ))}
            </select>
            <div className="button-group">
              <button className="btn search-btn">Search</button>
              <button className="btn match-btn">Match</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
