import React, {useEffect} from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";     
import Register from "./components/Register"; 
import Dashboard from "./components/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import VolunteerHistory from "./components/admin/VolunteerHistory";
import VolunteerMatch from "./components/admin/VolunteerMatch";
import EventList from "./components/admin/EventList";
import EventForm from "./components/admin/EventForm";
import { seedEventsOnce } from "./api/localDb";
import "./styles.css";
import Notifications from "./components/Notifications";
import VolunteerLayout from "./components/volunteer/VolunteerLayout";
import VolunteerProfile from "./components/volunteer/VolunteerProfile";

export default function App() {
  useEffect(() => { seedEventsOnce(); }, []);
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="volunteerHistory" element={<VolunteerHistory />} />
            <Route path="match" element={<VolunteerMatch />} />
            <Route path="events" element={<EventList />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/:id" element={<EventForm />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
          <Route path="/volunteer" element={<VolunteerLayout />}>
            <Route path="profile" element={<VolunteerProfile />} />
          </Route>
          <Route path="/eventForm" element={<EventForm />} />
          {/* <Route path="/notifications" element={<Notifications />} /> */}
        </Routes>
      </div>
    </Router>
  );
}
