import React, { useEffect, useState } from 'react';
import './VolunteerHistory.css';

const API_BASE = process.env.REACT_APP_API || 'http://localhost:5050';

export default function VolunteerHistory() {
  const [tab, setTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [resolvingUser, setResolvingUser] = useState(true);

  useEffect(() => {
    const resolveUserId = async () => {
      try {
        setResolvingUser(true);
        setError(null);
        const raw = localStorage.getItem('auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          const id = parsed?.user?._id || parsed?.user?.id;
          if (id) {
            setUserId(id);
            return;
          }
        }

        const email = localStorage.getItem('userEmail');
        if (email) {
          const res = await fetch(`${API_BASE}/api/volunteers?role=volunteer&email=${encodeURIComponent(email)}`);
          const data = await res.json();
          if (res.ok && Array.isArray(data) && data.length > 0) {
            setUserId(data[0].userId);
            return;
          }
        }

        setError('Unable to determine logged-in volunteer. Please sign in again or set REACT_APP_API.');
      } catch (err) {
        console.error(err);
        setError('Unable to determine volunteer identity.');
      } finally {
        setResolvingUser(false);
      }
    };

    resolveUserId();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/assignments/volunteers/${userId}/assignments?tab=${tab}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setRows([]);
        setError('Failed to load volunteer history.');
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

      {resolvingUser ? (
        <p>Loading volunteer profile…</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : loading ? (
        <p>Loading assignments…</p>
      ) : rows.length === 0 ? (
        <p>No records.</p>
      ) : (
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
                <td>{r.event?.eventName}</td>
                <td>{r.event?.description}</td>
                <td>{r.event?.location}</td>
                <td>{Array.isArray(r.event?.requiredSkills) ? r.event.requiredSkills.join(', ') : ''}</td>
                <td>{r.event?.urgency}</td>
                <td>{r.event?.eventDate ? new Date(r.event.eventDate).toLocaleString() : 'N/A'}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
