// src/components/VolunteerMatch.js
import React, { useState, useEffect } from "react";
import "./VolunteerMatch.css";

export default function VolunteerMatch() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [matchedEvents, setMatchedEvents] = useState({});

  // ✅ Load volunteers and events (simulate backend)
  useEffect(() => {
    const storedVolunteers = JSON.parse(localStorage.getItem("volunteers")) || [];
    const storedEvents = JSON.parse(localStorage.getItem("events")) || [
      {
        name: "Food Drive",
        location: "Austin",
        requiredSkills: ["team work", "driving"],
        date: "2025-10-21",
        neededVolunteers: 3,
        assignedVolunteers: 2,
      },
      {
        name: "Beach Cleanup",
        location: "Miami",
        requiredSkills: ["team work", "gardening"],
        date: "2025-10-22",
        neededVolunteers: 5,
        assignedVolunteers: 5,
      },
      {
        name: "Tree Planting",
        location: "Phoenix",
        requiredSkills: ["gardening", "leadership"],
        date: "2025-10-25",
        neededVolunteers: 4,
        assignedVolunteers: 1,
      },
    ];

    setVolunteers(storedVolunteers);
    setEvents(storedEvents);
  }, []);

  // ✅ Match scoring logic
  const getMatchingEvents = (volunteer, events) => {
    return events
      .map((event) => {
        let score = 0;

        if (event.assignedVolunteers >= event.neededVolunteers) {
          return { ...event, score: 0 };
        }

        const matchedSkills = volunteer.skills?.filter((skill) =>
          event.requiredSkills.includes(skill)
        );
        score += (matchedSkills?.length || 0) * 2;

        if (event.location.toLowerCase() === volunteer.city?.toLowerCase()) {
          score += 1;
        }

        if (volunteer.availability?.includes(event.date)) {
          score += 1;
        }

        return { ...event, score };
      })
      .sort((a, b) => b.score - a.score);
  };

  // ✅ Admin clicks “Search Matches” for one volunteer
  const handleSearch = (volunteer) => {
    const matches = getMatchingEvents(volunteer, events);
    setMatchedEvents((prev) => ({
      ...prev,
      [volunteer.fullName]: matches,
    }));
  };

  // ✅ Volunteer is matched to event (with backend-like update)
  const handleMatch = (volunteer, event) => {
    if (event.assignedVolunteers >= event.neededVolunteers) {
      alert(`Sorry, ${event.name} is already full.`);
      return;
    }

    // 🧠 Update event data (simulate backend update)
    const updatedEvents = events.map((ev) =>
      ev.name === event.name
        ? { ...ev, assignedVolunteers: ev.assignedVolunteers + 1 }
        : ev
    );
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    // 🧠 Remove matched volunteer from the system (optional)
    const updatedVolunteers = volunteers.filter(
      (v) => v.fullName !== volunteer.fullName
    );
    setVolunteers(updatedVolunteers);
    localStorage.setItem("volunteers", JSON.stringify(updatedVolunteers));

    // 🧠 Remove volunteer from match results view
    const updatedMatches = { ...matchedEvents };
    delete updatedMatches[volunteer.fullName];
    setMatchedEvents(updatedMatches);

    alert(`${volunteer.fullName} successfully matched to ${event.name}!`);
  };

  return (
    <div className="volunteer-match">
      <header>
        <h2>Volunteer Matching Dashboard</h2>
      </header>

      {volunteers.length === 0 ? (
        <p>No volunteers available to match. All are assigned or none exist.</p>
      ) : (
        <div className="volunteer-list">
          {volunteers.map((vol, i) => (
            <div key={i} className="volunteer-card">
              <h3>{vol.fullName}</h3>
              <p><strong>City:</strong> {vol.city}</p>
              <p><strong>Skills:</strong> {vol.skills?.join(", ") || "None"}</p>

              <button className="btn search-btn" onClick={() => handleSearch(vol)}>
                Search Best Matches
              </button>

              {matchedEvents[vol.fullName] && (
                <div className="event-results">
                  <h4>Matched Events for {vol.fullName}</h4>
                  <ul>
                    {matchedEvents[vol.fullName].map((event, index) => (
                      <li key={index}>
                        <strong>{event.name}</strong> — Score: {event.score}{" "}
                        ({event.assignedVolunteers}/{event.neededVolunteers})
                        {event.assignedVolunteers >= event.neededVolunteers ? (
                          <span style={{ color: "red" }}> (Full)</span>
                        ) : (
                          <button
                            className="btn match-btn"
                            onClick={() => handleMatch(vol, event)}
                          >
                            Match
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
