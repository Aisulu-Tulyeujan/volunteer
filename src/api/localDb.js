
const BASE = process.env.REACT_APP_API_BASE || "http://localhost:5050/api";

const toUI = (e) => ({
  id: e._id || e.id,
  name: e.eventName ?? e.name,
  description: e.description ?? "",
  location: e.location ?? "",
  requiredSkills: Array.isArray(e.requiredSkills) ? e.requiredSkills : [],
  urgency: e.urgency ?? "",
  eventDate: (e.eventDate || "").slice(0, 10),
  neededVolunteers: e.neededVolunteers ?? 1,
  assignedVolunteers: e.assignedVolunteers ?? 0,
});
const toServer = (e) => ({
  eventName: e.name,
  description: e.description,
  location: e.location,
  requiredSkills: Array.isArray(e.requiredSkills) ? e.requiredSkills : String(e.requiredSkills || "")
    .split(",").map(s => s.trim()).filter(Boolean),
  urgency: e.urgency,
  eventDate: e.eventDate,
  neededVolunteers: Number(e.neededVolunteers ?? 1),
  assignedVolunteers: Number(e.assignedVolunteers ?? 0),
});

export async function getAllEvents() {
  const res = await fetch(`${BASE}/events`);
  if (!res.ok) throw new Error("Failed to load events");
  const data = await res.json();
  return data.map(toUI);
}

export async function getEventById(id) {
  const res = await fetch(`${BASE}/events/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load event");
  return toUI(await res.json());
}

export async function upsertEvent(event) {
  const payload = toServer(event);
  if (event.id) {
    const res = await fetch(`${BASE}/events/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update event");
    return toUI(await res.json());
  } else {
    const res = await fetch(`${BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create event");
    return toUI(await res.json());
  }
}

export async function deleteEvent(id) {
  const res = await fetch(`${BASE}/events/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error("Failed to delete event");
  return true;
}

const NOTIFS_KEY = 'notifications';
const read = (k, f) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const addNotification = (n) => {
  const list = read(NOTIFS_KEY, []);
  list.push({ id: crypto?.randomUUID?.() || (Date.now().toString(36)+Math.random().toString(36).slice(2)),
              createdAt: new Date().toISOString(), ...n });
  write(NOTIFS_KEY, list);
};
