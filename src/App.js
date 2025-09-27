import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";     
import Register from "./components/Register"; 
import Dashboard from "./components/Dashboard";
import AdminLayout from "./components/admin/AdminLayout";
import VolunteerHistory from "./components/admin/VolunteerHistory";
import VolunteerMatch from "./components/admin/VolunteerMatch";
import Notifications from "./components/Notifications";
import "./styles.css";  

export default function App() {
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
          </Route>
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </Router>
  );
}
