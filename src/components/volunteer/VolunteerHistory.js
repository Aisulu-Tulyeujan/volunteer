import React, { useEffect, useState } from 'react';
import './VolunteerHistory.css';

const API_BASE = process.env.REACT_APP_API || 'http://localhost:3000';

// Helper: get logged-in userId (adapt to your auth)
function getCurrentUserId() {
  const raw = localStorage.getItem('auth');
  try {
    const parsed = JSON.parse(raw);
    return parsed?.user?._id; // adjust to your login payload
  } catch { return null; }
}

export default function VolunteerHistory() {
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/assignments/volunteers/${userId}/assignments?tab=${tab}`);
        const data = await res.json();
        setRows(data || []);
      } catch (e) {
        console.error(e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, userId]);

  return (
    <div className="vhistory">
      <h2>Volunteer History</h2>

      <div className="tabs">
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Past</button>
      </div>

      {loading ? <p>Loading...</p> : (
        rows.length === 0 ? <p>No records.</p> : (
          <table className="vh-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Required Skills</th>
                <th>Urgency</th>
                <th>Event Date</th>
                <th>Your Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.event.eventName || r.event.name}</td>
                  <td>{r.event.description}</td>
                  <td>{r.event.location}</td>
                  <td>{Array.isArray(r.event.requiredSkills) ? r.event.requiredSkills.join(', ') : ''}</td>
                  <td>{r.event.urgency}</td>
                  <td>{new Date(r.event.eventDate).toLocaleString()}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
