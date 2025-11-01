import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import VolunteerMatch from '../VolunteerMatch';

const sampleEvents = [
  {
    _id: 'event-1',
    eventName: 'Food Drive',
    description: 'Pack meals',
    location: 'Houston',
    requiredSkills: ['Teamwork'],
    urgency: 'High',
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    neededVolunteers: 5,
    assignedVolunteers: 1,
  },
];

const sampleVolunteers = [
  {
    _id: 'vol-1',
    userId: 'vol-1',
    fullName: 'Alex Volunteer',
    city: 'Houston',
    skills: ['Teamwork'],
    availability: [new Date(Date.now() + 86400000).toISOString().slice(0, 10)],
  },
];

describe('VolunteerMatch', () => {
  test('loads events and volunteers then matches', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => sampleEvents,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => sampleVolunteers,
      });

    render(<VolunteerMatch />);

    expect(await screen.findByText(/Volunteer Matching Dashboard/i)).toBeInTheDocument();

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/Alex Volunteer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /search best matches/i }));

    await waitFor(() => expect(screen.getByText(/Food Drive/i)).toBeInTheDocument());

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Volunteer matched successfully' }),
    });

    fireEvent.click(screen.getByRole('button', { name: /^Match$/i }));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Alex Volunteer'))
    );
  });

  test('surfaces error when bootstrap fetch fails', async () => {
    global.fetch
      .mockRejectedValueOnce(new Error('Network down'))
      .mockRejectedValueOnce(new Error('Network down'));

    render(<VolunteerMatch />);

    expect(await screen.findByText(/Volunteer Matching Dashboard/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Network down/i)).toBeInTheDocument());
  });
});
