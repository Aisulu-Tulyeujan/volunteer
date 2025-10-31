// src/components/VolunteerMatch.js
import React, { useState, useEffect } from "react";
import "./VolunteerMatch.css";

const API_BASE = process.env.REACT_APP_API || "http://localhost:5050";

const asDateOnly = (input) => {
  if (!input) return null;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

export default function VolunteerMatch() {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [matchedEvents, setMatchedEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [eventsRes, volunteersRes] = await Promise.all([
          fetch(`${API_BASE}/api/events`),
          fetch(`${API_BASE}/api/volunteers?role=volunteer`)
        ]);

        const eventsData = await eventsRes.json();
        const volunteersData = await volunteersRes.json();

        if (!eventsRes.ok) {
          throw new Error(eventsData.error || "Failed to load events");
        }
        if (!volunteersRes.ok) {
          throw new Error(volunteersData.error || "Failed to load volunteers");
        }

        setEvents(eventsData);
        setVolunteers(volunteersData);
      } catch (err) {
        console.error("Volunteer match bootstrap failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMatchingEvents = (volunteer, events) => {
    return events
      .map((event) => {
        let score = 0;

        if ((event.assignedVolunteers || 0) >= (event.neededVolunteers || 0)) {
          return { ...event, score: 0 };
        }

        const matchedSkills = volunteer.skills?.filter((skill) =>
          event.requiredSkills?.includes(skill)
        );
        score += (matchedSkills?.length || 0) * 2;

        if (
          event.location &&
          volunteer.city &&
          event.location.toLowerCase().includes(volunteer.city.toLowerCase())
        ) {
          score += 1;
        }

        const volunteerAvailability = volunteer.availability?.map(asDateOnly) || [];
        const eventDate = asDateOnly(event.eventDate);
        if (eventDate && volunteerAvailability.includes(eventDate)) {
          score += 1;
        }

        return { ...event, score };
      })
      .sort((a, b) => b.score - a.score);
  };

  const handleSearch = (volunteer) => {
    const matches = getMatchingEvents(volunteer, events);
    setMatchedEvents((prev) => ({
      ...prev,
      [volunteer._id]: matches,
    }));
  };

  const handleMatch = async (volunteer, event) => {
    if (!volunteer.userId || !event._id) {
      alert("Missing volunteer or event identifiers.");
      return;
    }

    try {
      const payload = {
        userId: volunteer.userId,
        eventId: event._id,
        matchScore: event.score || 0,
      };

      const res = await fetch(`${API_BASE}/api/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Match failed");
        return;
      }

      const updatedEvents = events.map((ev) =>
        ev._id === event._id
          ? { ...ev, assignedVolunteers: (ev.assignedVolunteers || 0) + 1 }
          : ev
      );

      setEvents(updatedEvents);

      setMatchedEvents((prev) => {
        const clone = { ...prev };
        delete clone[volunteer._id];
        return clone;
      });

      alert(`${volunteer.fullName || volunteer.user?.name} matched to ${event.eventName}!`);
    } catch (e) {
      console.error(e);
      alert("Server error while matching");
    }
  };

  if (loading) {
    return <p>Loading matches...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="volunteer-match">
      <header>
        <h2>Volunteer Matching Dashboard</h2>
      </header>

      {volunteers.length === 0 ? (
        <p>No volunteers available to match. All are assigned or none exist.</p>
      ) : (
        <div className="volunteer-list">
          {volunteers.map((vol) => (
            <div key={vol._id} className="volunteer-card">
              <h3>{vol.fullName || vol.user?.name}</h3>
              <p><strong>City:</strong> {vol.city || "N/A"}</p>
              <p><strong>Skills:</strong> {vol.skills?.join(", ") || "None"}</p>

              <button className="btn search-btn" onClick={() => handleSearch(vol)}>
                Search Best Matches
              </button>

              {matchedEvents[vol._id]?.length ? (
                <div className="event-results">
                  <h4>Matched Events</h4>
                  <ul>
                    {matchedEvents[vol._id].map((event) => (
                      <li key={event._id}>
                        <strong>{event.eventName}</strong> — Score: {event.score}{" "}
                        ({event.assignedVolunteers}/{event.neededVolunteers})
                        {(event.assignedVolunteers || 0) >= (event.neededVolunteers || 0) ? (
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
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
