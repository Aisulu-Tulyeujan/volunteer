import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllEvents, deleteEvent } from "../../api/localDb";

export default function EventList() {
  const nav = useNavigate();
  const rows = getAllEvents().slice().sort((a,b)=>a.eventDate.localeCompare(b.eventDate));

  const onDelete = (id) => {
    if (!window.confirm("Delete this event?")) return;
    deleteEvent(id);
    nav(0); 
  };

  return (
    <div className="event-page">
      <div className="event-header">
        <h2>Event Management</h2>
        <Link className="btn" to="/admin/events/new">+ Create Event</Link>
      </div>

      <div className="card">
        <table className="event-table">
          <thead>
            <tr>
              <th>Date</th><th>Name</th><th>Urgency</th><th>Required Skills</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.id}>
                <td>{e.eventDate}</td>
                <td>{e.name}</td>
                <td>{e.urgency}</td>
                <td>{e.requiredSkills.join(", ")}</td>
                <td>
                  <button className="btn" onClick={() => nav(`/admin/events/${e.id}`)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => onDelete(e.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5">No events yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
