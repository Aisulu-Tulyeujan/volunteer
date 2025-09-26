import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const { pathname } = useLocation();

  const isActive = (seg) => pathname.includes(seg) ? { background: "#f3f4f6" } : {};

  return (
    <div className="admin">
      <aside className="sidebar">
        <h3 >Admin Tools</h3>
        <ul >
          <li><Link to="/admin/match">Volunteer Matching</Link></li>
          <li><Link to="/admin/notifications">Notifications</Link></li>
          <li><Link to="/admin/history">Volunteer History</Link></li>
        </ul>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
