import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VolunteerHistory from '../VolunteerHistory';

const now = Date.now();
const upcomingEvent = {
  _id: 'assignment-upcoming',
  status: 'Assigned',
  event: {
    eventName: 'Upcoming Cleanup',
    description: 'Help clean park',
    location: 'Houston',
    requiredSkills: ['Teamwork'],
    eventDate: new Date(now + 86400000).toISOString(),
  },
  user: { name: 'Alex' },
};

const pastEvent = {
  _id: 'assignment-past',
  status: 'Completed',
  event: {
    eventName: 'Past Drive',
    description: 'Pack meals',
    location: 'Houston',
    requiredSkills: ['Logistics'],
    eventDate: new Date(now - 86400000).toISOString(),
  },
  user: { name: 'Jamie' },
};

describe('Admin VolunteerHistory', () => {
  test('filters assignments by tab', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [upcomingEvent, pastEvent],
    });

    render(<VolunteerHistory />);

    expect(await screen.findByText(/Volunteer History/i)).toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(screen.getByText(/Upcoming Cleanup/i)).toBeInTheDocument();
    expect(screen.queryByText(/Past Drive/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /past/i }));

    expect(await screen.findByText(/Past Drive/i)).toBeInTheDocument();
  });

  test('shows error from API', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server exploded' }),
    });

    render(<VolunteerHistory />);

    expect(await screen.findByText(/Volunteer History/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Server exploded/i)).toBeInTheDocument());
  });
});
