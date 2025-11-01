/** @jest-environment node */

const mockEventDetailsConstructor = jest.fn();
mockEventDetailsConstructor.find = jest.fn();
mockEventDetailsConstructor.findById = jest.fn();
mockEventDetailsConstructor.findByIdAndDelete = jest.fn();

jest.mock('../../server/models/EventDetails', () => mockEventDetailsConstructor);

const eventController = require('../../server/controllers/eventController');
const EventDetails = require('../../server/models/EventDetails');

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((payload) => {
    res.body = payload;
    return res;
  });
  res.send = jest.fn().mockImplementation((payload) => {
    res.body = payload;
    return res;
  });
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();

  EventDetails.mockImplementation((data) => {
    const instance = {
      ...data,
      _id: 'event-id',
      save: jest.fn().mockResolvedValue(undefined),
    };
    return instance;
  });

  EventDetails.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue([]),
  });
  EventDetails.findById.mockResolvedValue(null);
  EventDetails.findByIdAndDelete.mockResolvedValue(null);
});

describe('eventController.getEvents', () => {
  test('returns sanitized events sorted by date', async () => {
    const events = [
      {
        _id: '1',
        eventName: 'Food Drive',
        description: 'Collect food items',
        location: 'Community Center',
        requiredSkills: ['organization'],
        urgency: 'High',
        eventDate: new Date('2025-01-01'),
        neededVolunteers: 10,
        assignedVolunteers: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const sortMock = jest.fn().mockResolvedValue(events);
    EventDetails.find.mockReturnValue({ sort: sortMock });

    const req = {};
    const res = createMockRes();

    await eventController.getEvents(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        eventName: 'Food Drive',
        location: 'Community Center',
      }),
    ]);
  });

  test('responds with 500 when fetching fails', async () => {
    EventDetails.find.mockImplementation(() => {
      throw new Error('db error');
    });

    const res = createMockRes();

    await eventController.getEvents({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch events' });
  });
});

describe('eventController.getEventById', () => {
  test('returns 404 when event is missing', async () => {
    EventDetails.findById.mockResolvedValueOnce(null);
    const req = { params: { id: 'missing' } };
    const res = createMockRes();

    await eventController.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  test('returns 400 when an invalid id causes an error', async () => {
    EventDetails.findById.mockImplementationOnce(() => {
      throw new Error('CastError');
    });
    const res = createMockRes();

    await eventController.getEventById({ params: { id: 'bad' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid event id' });
  });

  test('returns the sanitized event when found', async () => {
    const event = {
      _id: 'event-1',
      eventName: 'Food Drive',
      description: 'Collect food items',
      location: 'Community Center',
      requiredSkills: ['organization'],
      urgency: 'High',
      eventDate: new Date('2025-01-01'),
      neededVolunteers: 10,
      assignedVolunteers: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    EventDetails.findById.mockResolvedValueOnce(event);
    const res = createMockRes();

    await eventController.getEventById({ params: { id: 'event-1' } }, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ eventName: 'Food Drive' }));
  });
});

describe('eventController.createEvent', () => {
  test('validates required fields', async () => {
    const req = { body: { eventName: 'Food Drive' } };
    const res = createMockRes();

    await eventController.createEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields.' });
  });

  test('persists a new event and returns sanitized payload', async () => {
    const req = {
      body: {
        eventName: 'Food Drive',
        description: 'Collect food items',
        location: 'Community Center',
        requiredSkills: ['organization'],
        urgency: 'High',
        eventDate: '2025-01-01',
        neededVolunteers: 10,
      },
    };
    const res = createMockRes();

    await eventController.createEvent(req, res);

    expect(EventDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Food Drive',
        neededVolunteers: 10,
        assignedVolunteers: 0,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: 'Food Drive',
        neededVolunteers: 10,
      })
    );
  });
});

describe('eventController.updateEvent', () => {
  test('returns 404 when event is absent', async () => {
    EventDetails.findById.mockResolvedValueOnce(null);
    const req = { params: { id: 'missing' }, body: { description: 'Updated' } };
    const res = createMockRes();

    await eventController.updateEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  test('updates mutable fields and returns sanitized event', async () => {
    const eventDoc = {
      _id: 'event-1',
      eventName: 'Food Drive',
      description: 'Collect food items',
      location: 'Community Center',
      requiredSkills: ['organization'],
      urgency: 'High',
      eventDate: new Date('2025-01-01'),
      neededVolunteers: 10,
      assignedVolunteers: 5,
      set: jest.fn(function (key, value) {
        this[key] = value;
      }),
      save: jest.fn().mockResolvedValue(undefined),
    };
    EventDetails.findById.mockResolvedValueOnce(eventDoc);

    const req = { params: { id: 'event-1' }, body: { description: 'Updated description' } };
    const res = createMockRes();

    await eventController.updateEvent(req, res);

    expect(eventDoc.set).toHaveBeenCalledWith('description', 'Updated description');
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ description: 'Updated description' }));
  });
});

describe('eventController.deleteEvent', () => {
  test('returns 404 when event is missing', async () => {
    EventDetails.findByIdAndDelete.mockResolvedValueOnce(null);
    const req = { params: { id: 'missing' } };
    const res = createMockRes();

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  test('sends 204 when deletion succeeds', async () => {
    EventDetails.findByIdAndDelete.mockResolvedValueOnce({ _id: 'event-1' });
    const req = { params: { id: 'event-1' } };
    const res = createMockRes();

    await eventController.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});

