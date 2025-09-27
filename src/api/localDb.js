
const read = (k, f) => JSON.parse(localStorage.getItem(k) || JSON.stringify(f));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));


const EVENTS_KEY = 'events';
const idgen = () => (crypto?.randomUUID?.() ||
  Date.now().toString(36) + Math.random().toString(36).slice(2));

export const getAllEvents = () => read(EVENTS_KEY, []);
export const getEventById = (id) => getAllEvents().find(e => e.id === id);

export const upsertEvent = (event) => {
  const rows = getAllEvents();
  if (!event.id) event.id = idgen();
  const i = rows.findIndex(r => r.id === event.id);
  i >= 0 ? rows[i] = event : rows.push(event);
  write(EVENTS_KEY, rows);
  return event;
};

export const deleteEvent = (id) =>
  write(EVENTS_KEY, getAllEvents().filter(e => e.id !== id));

export const seedEventsOnce = () => {
  if (getAllEvents().length) return;
  write(EVENTS_KEY, [
    { id:idgen(), name:'Food Drive – Warehouse', description:'Sort and pack donations.',
      location:'123 Community Way', requiredSkills:['Logistics','Driving'],
      urgency:'High', eventDate:'2025-10-05' },
    { id:idgen(), name:'Park Cleanup', description:'Collect trash and plastics.',
      location:'City Park, North Gate', requiredSkills:['First Aid','Logistics'],
      urgency:'Medium', eventDate:'2025-10-12' },
  ]);
};


const NOTIFS_KEY = 'notifications';
export const addNotification = (n) => {
  const list = read(NOTIFS_KEY, []);
  list.push({ id:idgen(), createdAt:new Date().toISOString(), ...n });
  write(NOTIFS_KEY, list);
};
