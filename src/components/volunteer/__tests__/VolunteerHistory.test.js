import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VolunteerHistory from '../VolunteerHistory';

const futureDate = new Date(Date.now() + 86400000).toISOString();

const sampleAssignments = [
  {
    _id: 'assign-1',
    status: 'Confirmed',
    event: {
      eventName: 'Community Build',
      description: 'Assist with building homes',
      location: 'Houston',
      requiredSkills: ['Construction'],
      urgency: 'Medium',
      eventDate: futureDate,
    },
  },
];

describe('Volunteer VolunteerHistory', () => {
  beforeEach(() => {
    localStorage.setItem(
      'auth',
      JSON.stringify({ user: { _id: 'vol-1', email: 'volunteer@example.com' } })
    );
    localStorage.setItem('userEmail', 'volunteer@example.com');
  });

  test('renders upcoming assignments', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleAssignments,
    });

    render(<VolunteerHistory />);

    expect(await screen.findByText(/Volunteer History/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Community Build/i)).toBeInTheDocument());
  });

  test('handles fetch failure gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('timeout'));

    render(<VolunteerHistory />);

    expect(await screen.findByText(/Volunteer History/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText(/Failed to load volunteer history./i)).toBeInTheDocument()
    );
  });
});
