/** @jest-environment node */

const mockMongoose = {
  isValidObjectId: jest.fn(),
};
jest.mock('mongoose', () => mockMongoose);

const mockVolunteerAssignment = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
};
jest.mock('../../server/models/VolunteerAssignment', () => mockVolunteerAssignment);

const mockVolunteerHistory = {
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};
jest.mock('../../server/models/VolunteerHistoryUser', () => mockVolunteerHistory);

const mockEventDetails = {
  findById: jest.fn(),
};
jest.mock('../../server/models/EventDetails', () => mockEventDetails);

const assignmentRoutes = require('../../server/routes/assignmentRoutes');

const getRouteHandler = (path, method) => {
  const layer = assignmentRoutes.stack.find(
    (entry) => entry.route && entry.route.path === path && entry.route.methods[method]
  );
  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }
  return layer.route.stack[0].handle;
};

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

const postHandler = getRouteHandler('/', 'post');
const getAssignmentsHandler = getRouteHandler('/volunteers/:userId/assignments', 'get');
const getHistoryHandler = getRouteHandler('/history', 'get');
const patchStatusHandler = getRouteHandler('/:id/status', 'patch');

beforeEach(() => {
  jest.clearAllMocks();
  mockMongoose.isValidObjectId.mockReturnValue(true);
  mockEventDetails.findById.mockResolvedValue(null);
  mockVolunteerAssignment.create.mockResolvedValue(null);
  mockVolunteerAssignment.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    }),
  });
  mockVolunteerAssignment.findById.mockResolvedValue(null);
  mockVolunteerHistory.findOneAndUpdate.mockResolvedValue(null);
  mockVolunteerHistory.findOne.mockResolvedValue(null);
  mockVolunteerHistory.create.mockResolvedValue(null);
});

describe('POST /api/assignments', () => {
  test('validates user and event ids', async () => {
    mockMongoose.isValidObjectId.mockReturnValueOnce(false);
    const req = { body: { userId: 'bad', eventId: 'event' } };
    const res = createMockRes();

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid userId or eventId' });
  });

  test('returns 404 when the event cannot be found', async () => {
    mockEventDetails.findById.mockResolvedValueOnce(null);
    const req = { body: { userId: 'u1', eventId: 'e1' } };
    const res = createMockRes();

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
  });

  test('prevents matching when the event is full', async () => {
    mockEventDetails.findById.mockResolvedValueOnce({
      assignedVolunteers: 3,
      neededVolunteers: 3,
    });
    const req = { body: { userId: 'u1', eventId: 'e1' } };
    const res = createMockRes();

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Event is already full' });
  });

  test('maps duplicate assignments to HTTP 409', async () => {
    const eventDoc = {
      _id: 'e1',
      assignedVolunteers: 1,
      neededVolunteers: 5,
      eventDate: new Date(Date.now() + 86400000),
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockEventDetails.findById.mockResolvedValueOnce(eventDoc);
    mockVolunteerAssignment.create.mockRejectedValueOnce(Object.assign(new Error('duplicate'), { code: 11000 }));

    const req = { body: { userId: 'u1', eventId: 'e1', matchScore: 0.9 } };
    const res = createMockRes();

    await postHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Volunteer already assigned to this event' });
  });

  test('creates an assignment, increments counts, and returns serialized payload', async () => {
    const eventDoc = {
      _id: 'e1',
      assignedVolunteers: 1,
      neededVolunteers: 5,
      eventDate: new Date(Date.now() + 86400000),
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockEventDetails.findById.mockResolvedValueOnce(eventDoc);

    const assignmentDoc = {
      _id: 'a1',
      userId: 'u1',
      eventId: 'e1',
      matchScore: 0.9,
      status: 'Assigned',
      assignedDate: new Date(),
      populate: jest.fn().mockImplementation(async () => ({
        _id: 'a1',
        userId: 'u1',
        eventId: {
          _id: 'e1',
          eventName: 'Food Drive',
          description: 'Collect food',
          location: 'Center',
          requiredSkills: ['organizing'],
          urgency: 'High',
          eventDate: eventDoc.eventDate,
          neededVolunteers: 5,
          assignedVolunteers: 2,
        },
        status: 'Assigned',
        matchScore: 0.9,
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };
    mockVolunteerAssignment.create.mockResolvedValueOnce(assignmentDoc);

    const req = { body: { userId: 'u1', eventId: 'e1', matchScore: 0.9 } };
    const res = createMockRes();

    await postHandler(req, res);

    expect(eventDoc.assignedVolunteers).toBe(2);
    expect(eventDoc.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Volunteer matched successfully',
      assignment: expect.objectContaining({
        userId: 'u1',
        eventId: 'e1',
        event: expect.objectContaining({
          eventName: 'Food Drive',
        }),
      }),
    });
  });
});

describe('GET /api/volunteers/:userId/assignments', () => {
  test('validates userId parameter', async () => {
    mockMongoose.isValidObjectId.mockReturnValueOnce(false);
    const req = { params: { userId: 'bad' }, query: {} };
    const res = createMockRes();

    await getAssignmentsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid userId' });
  });

  test('filters upcoming assignments and returns serialized results', async () => {
    const assignments = [
      {
        _id: 'a1',
        userId: 'u1',
        eventId: {
          _id: 'e1',
          eventName: 'Future Event',
          eventDate: new Date(Date.now() + 86400000),
          description: 'Future',
          location: 'Center',
          requiredSkills: [],
          urgency: 'High',
          neededVolunteers: 5,
          assignedVolunteers: 1,
        },
        status: 'Assigned',
        matchScore: 0.8,
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'a2',
        userId: 'u1',
        eventId: {
          _id: 'e2',
          eventName: 'Past Event',
          eventDate: new Date(Date.now() - 86400000),
          description: 'Past',
          location: 'Center',
          requiredSkills: [],
          urgency: 'Low',
          neededVolunteers: 5,
          assignedVolunteers: 5,
        },
        status: 'Completed',
        matchScore: 0.7,
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sortMock = jest.fn().mockResolvedValue(assignments);
    mockVolunteerAssignment.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: sortMock,
      }),
    });

    const req = { params: { userId: 'u1' }, query: { tab: 'upcoming' } };
    const res = createMockRes();

    await getAssignmentsHandler(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        eventId: 'e1',
        event: expect.objectContaining({ eventName: 'Future Event' }),
      }),
    ]);
  });
});

describe('GET /api/assignments/history', () => {
  test('returns assignments including populated user data', async () => {
    const assignments = [
      {
        _id: 'a1',
        userId: {
          _id: 'u1',
          name: 'Alice',
          email: 'alice@example.com',
          role: 'volunteer',
        },
        eventId: {
          _id: 'e1',
          eventName: 'Food Drive',
          description: 'Collect food',
          location: 'Center',
          requiredSkills: [],
          urgency: 'High',
          eventDate: new Date(),
          neededVolunteers: 5,
          assignedVolunteers: 2,
        },
        status: 'Assigned',
        matchScore: 0.8,
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const sortMock = jest.fn().mockResolvedValue(assignments);
    const populateUserMock = jest.fn().mockReturnValue({ sort: sortMock });
    const populateEventMock = jest.fn().mockReturnValue({ populate: populateUserMock });
    mockVolunteerAssignment.find.mockReturnValue({ populate: populateEventMock });

    const req = { query: {} };
    const res = createMockRes();

    await getHistoryHandler(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        user: expect.objectContaining({ email: 'alice@example.com' }),
        event: expect.objectContaining({ eventName: 'Food Drive' }),
      }),
    ]);
  });
});

describe('PATCH /api/assignments/:id/status', () => {
  test('returns 404 for missing assignment', async () => {
    mockVolunteerAssignment.findById.mockResolvedValueOnce(null);
    const req = { params: { id: 'a1' }, body: { status: 'Confirmed' } };
    const res = createMockRes();

    await patchStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Assignment not found' });
  });

  test('updates status and records volunteer history when completed', async () => {
    const assignmentDoc = {
      _id: 'a1',
      userId: 'u1',
      eventId: 'e1',
      status: 'Assigned',
      save: jest.fn().mockResolvedValue(undefined),
    };
    mockVolunteerAssignment.findById.mockResolvedValueOnce(assignmentDoc);
    mockVolunteerHistory.findOne.mockResolvedValueOnce(null);

    const req = { params: { id: 'a1' }, body: { status: 'Completed' } };
    const res = createMockRes();

    await patchStatusHandler(req, res);

    expect(assignmentDoc.status).toBe('Completed');
    expect(assignmentDoc.save).toHaveBeenCalled();
    expect(mockVolunteerHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', eventId: 'e1' })
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Status updated',
      assignment: assignmentDoc,
    });
  });
});

