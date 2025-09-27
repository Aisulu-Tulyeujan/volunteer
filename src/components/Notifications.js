import React from "react";
import "./Notifications.css";

export default function Notifications() {
  let notifications = [
    [["New event assigned"], ["Community Clean-Up on July 10th"]],
    [["Reminder"], ["Volunteer orientation on July 5th at 10 AM"]],
    [["Update"], ["Event location changed to Central Park"]],
    [["Reminder"], ["Please confirm your availability for upcoming events"]],
  ];
  return (
    <div id="notifications-page">
      <header id="notifications-header">
        <h1>Notifications</h1>
      </header>
      <main>
        <table className="notifications-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((note, index) => (
              <tr key={index}>
                <td data-label="Type">{note[0]}</td>
                <td data-label="Message">{note[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
