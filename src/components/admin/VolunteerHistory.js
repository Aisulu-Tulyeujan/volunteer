import React from "react";
import "./VolunteerHistory.css";

export default function VolunteerHistory() {
  // Mock data (replace later with API/DB)
  const events = [
    {
      id: 1,
      name: "Food Drive at Community Center",
      description: "Helping organize and distribute food to families in need.",
      location: "Community Hall, Downtown",
      skills: ["Organization", "Teamwork"],
      urgency: "High",
      date: "2025-10-01",
      volunteers: {
        Aisulu: "Participated",
        Rana: "Absent",
        Noelanie: "Participated",
      },
    },
    {
      id: 2,
      name: "Beach Cleanup Initiative",
      description: "Collecting trash and plastics to preserve marine life.",
      location: "Sunny Beach, Bay Area",
      skills: ["Physical Work", "Environmental Awareness"],
      urgency: "Medium",
      date: "2025-10-10",
      volunteers: {
        Aisulu: "Absent",
        Minh: "Participated",
        Rana: "Participated",
      },
    },
  ];

  return (
    <div className="event-management">
      <h2>Volunteer History</h2>

      <table className="event-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Description</th>
            <th>Location</th>
            <th>Required Skills</th>
            <th>Urgency</th>
            <th>Date</th>
            <th>Volunteers</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td>{event.name}</td>
              <td>{event.description}</td>
              <td>{event.location}</td>
              <td>{event.skills.join(", ")}</td>
              <td>{event.urgency}</td>
              <td>{event.date}</td>
              <td>
                <ul className="volunteer-list">
                  {Object.entries(event.volunteers).map(([name, status], i) => (
                    <li key={i} className={`volunteer ${status.toLowerCase()}`}>
                      {name}: {status}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
