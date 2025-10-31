import React, { useEffect, useMemo, useState } from "react";
import "./VolunteerHistory.css";

const API_BASE = process.env.REACT_APP_API || "http://localhost:5050";

const classify = (row) => {
  const eventDate = row.event?.eventDate ? new Date(row.event.eventDate) : null;
  if (!eventDate || Number.isNaN(eventDate.getTime())) {
    return "unknown";
  }
  const now = new Date();
  if (eventDate < now || row.status === "Completed") {
    return "past";
  }
  return "upcoming";
};

export default function VolunteerHistory() {
  const [tab, setTab] = useState("upcoming");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/assignments/history`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load volunteer history");
        }
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((row) => classify(row) === tab);
  }, [rows, tab]);

  return (
    <div className="event-management">
      <h2>Volunteer History</h2>

      <div className="tabs">
        <button className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")}>Upcoming</button>
        <button className={tab === "past" ? "active" : ""} onClick={() => setTab("past")}>Past</button>
        <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>All</button>
      </div>

      {loading ? <p>Loading...</p> :
        error ? <p className="error">{error}</p> :
          filtered.length === 0 ? <p>No volunteer history found.</p> : (
            <table className="event-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Volunteer</th>
                  <th>Status</th>
                  <th>Event Date</th>
                  <th>Location</th>
                  <th>Required Skills</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row._id}>
                    <td>{row.event?.eventName}</td>
                    <td>{row.user?.name || "Unknown"}</td>
                    <td>{row.status}</td>
                    <td>{row.event?.eventDate ? new Date(row.event.eventDate).toLocaleString() : "N/A"}</td>
                    <td>{row.event?.location || "N/A"}</td>
                    <td>{Array.isArray(row.event?.requiredSkills) ? row.event.requiredSkills.join(", ") : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </div>
  );
}
