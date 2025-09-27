import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./VolunteerLayout.css";

export default function VolunteerLayout() {
  return (
    <div className="volunteer-layout">
      <nav className="volunteer-nav">
        <ul className="nav-list">
          <li>
            <NavLink 
              to="/volunteer/profile" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/volunteer/notifications" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Notifications
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/volunteer/history" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              History
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/logout" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>

      <main className="volunteer-content">
        <Outlet />
      </main>
    </div>
  );
}
