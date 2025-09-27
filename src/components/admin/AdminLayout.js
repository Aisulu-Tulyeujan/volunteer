import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.css"; 

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <ul className="nav-list">
          <li>
            <NavLink 
              to="/admin/volunteerHistory" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Volunteer History
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/match" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Volunteer Match
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/Logout" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Logout
            </NavLink>
          </li>
          <li>
            <NavLink
            to="/admin/events"
            className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              Event Management
            </NavLink>
          </li>
        </ul>
      </nav>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
