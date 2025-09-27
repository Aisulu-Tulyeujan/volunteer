import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEventById, upsertEvent, addNotification } from "../../api/localDb";
import { SKILLS } from "../../constants/skills";

const MAX_NAME = 100;

export default function EventForm() {
  const nav = useNavigate();
  const { id } = useParams();
  const existing = id ? getEventById(id) : null;

  const [form, setForm] = useState(existing || {
    name:"", description:"", location:"",
    requiredSkills:[], urgency:"", eventDate:""
  });
  const [errors, setErrors] = useState({});
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSkill = (s) => setForm(p => {
    const ss = new Set(p.requiredSkills);
    ss.has(s) ? ss.delete(s) : ss.add(s);
    return { ...p, requiredSkills: Array.from(ss) };
  });

  const validate = () => {
    const e = {};
    if (!form.name) e.name = "Event name is required";
    if (form.name && form.name.length > MAX_NAME) e.name = `Max ${MAX_NAME} characters`;
    if (!form.description) e.description = "Description is required";
    if (!form.location) e.location = "Location is required";
    if (!form.requiredSkills.length) e.requiredSkills = "Select at least one skill";
    if (!form.urgency) e.urgency = "Select urgency";
    if (!form.eventDate) e.eventDate = "Pick a date";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const saved = upsertEvent({ ...form, id: existing?.id });
    addNotification({ userId:'admin', type:'update', eventId:saved.id,
      message:(existing?'Updated':'Created')+` event "${saved.name}"`});
    alert("Event saved");
    nav("/admin/events");
  };

  return (
    <div className="event-page">
      <div className="event-header"><h2>{existing ? "Edit Event" : "Create Event"}</h2></div>

      <div className="card event-form">
        <label>Event Name
          <input value={form.name} onChange={e=>set("name", e.target.value)} maxLength={MAX_NAME}/>
          <div className="err">{errors.name}</div>
        </label>

        <label>Event Description
          <textarea rows={4} value={form.description} onChange={e=>set("description", e.target.value)} />
          <div className="err">{errors.description}</div>
        </label>

        <label>Location
          <textarea rows={2} value={form.location} onChange={e=>set("location", e.target.value)} />
          <div className="err">{errors.location}</div>
        </label>

        <fieldset>
          <legend>Required Skills (choose at least one)</legend>
          <div className="chips">
            {SKILLS.map(s => (
              <label key={s} className="chip">
                <input type="checkbox"
                       checked={form.requiredSkills.includes(s)}
                       onChange={()=>toggleSkill(s)} /> {s}
              </label>
            ))}
          </div>
          <div className="err">{errors.requiredSkills}</div>
        </fieldset>

        <label>Urgency
          <select value={form.urgency} onChange={e=>set("urgency", e.target.value)}>
            <option value="">Select…</option>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <div className="err">{errors.urgency}</div>
        </label>

        <label>Event Date
          <input type="date" value={form.eventDate} onChange={e=>set("eventDate", e.target.value)} />
          <div className="err">{errors.eventDate}</div>
        </label>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn" onClick={onSubmit}>Save Event</button>
          <button className="btn" type="button" onClick={()=>nav("/admin/events")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
