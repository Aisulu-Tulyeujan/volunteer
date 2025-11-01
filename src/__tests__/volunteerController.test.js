/** @jest-environment node */

const mockUserProfileConstructor = jest.fn();
mockUserProfileConstructor.find = jest.fn();
mockUserProfileConstructor.findOne = jest.fn();
mockUserProfileConstructor.findById = jest.fn();
mockUserProfileConstructor.findByIdAndDelete = jest.fn();

const mockUserCredentials = {
  findById: jest.fn(),
  findOne: jest.fn(),
};

jest.mock('../../server/models/UserProfile', () => mockUserProfileConstructor);
jest.mock('../../server/models/UserCredentials', () => mockUserCredentials);

const volunteerController = require('../../server/controllers/volunteerController');
const UserProfile = require('../../server/models/UserProfile');
const UserCredentials = require('../../server/models/UserCredentials');

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

  UserProfile.mockImplementation((data) => {
    const instance = {
      ...data,
      _id: 'profile-id',
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockImplementation(async () => ({
        _id: 'profile-id',
        user: {
          _id: data.user,
          name: 'Test User',
          email: 'user@example.com',
          role: 'volunteer',
        },
        fullName: data.fullName,
        address: data.address,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        skills: data.skills || [],
        preferences: data.preferences || [],
        availability: data.availability || [],
      })),
    };
    return instance;
  });

  UserProfile.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue([]),
    }),
  });
  UserProfile.findOne.mockResolvedValue(null);
  UserProfile.findById.mockResolvedValue(null);
  UserProfile.findByIdAndDelete.mockResolvedValue(null);

  UserCredentials.findById.mockResolvedValue(null);
  UserCredentials.findOne.mockResolvedValue(null);
});

describe('volunteerController.getProfiles', () => {
  test('returns sanitized profiles filtered by role', async () => {
    const profileDocs = [
      {
        _id: '1',
        user: { _id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
        fullName: 'Alice',
        address: '123 Main',
        city: 'Austin',
        state: 'TX',
        zipcode: '78701',
        skills: ['organizing'],
        preferences: [],
        availability: [],
      },
      {
        _id: '2',
        user: { _id: 'u2', name: 'Bob', email: 'bob@example.com', role: 'volunteer' },
        fullName: 'Bob',
        address: '',
        city: 'Houston',
        state: 'TX',
        zipcode: '77001',
        skills: ['cooking'],
        preferences: [],
        availability: [],
      },
    ];

    const sortMock = jest.fn().mockResolvedValue(profileDocs);
    UserProfile.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: sortMock,
      }),
    });

    const req = { query: { role: 'admin' } };
    const res = createMockRes();

    await volunteerController.getProfiles(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: '1',
        fullName: 'Alice',
        user: expect.objectContaining({ role: 'admin' }),
      }),
    ]);
  });

  test('returns profiles filtered by email when provided', async () => {
    const profileDocs = [
      {
        _id: '1',
        user: { _id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'admin' },
        fullName: 'Alice',
        address: '123 Main',
        city: 'Austin',
        state: 'TX',
        zipcode: '78701',
        skills: ['organizing'],
        preferences: [],
        availability: [],
      },
      {
        _id: '2',
        user: { _id: 'u2', name: 'Bob', email: 'bob@example.com', role: 'volunteer' },
        fullName: 'Bob',
        address: '',
        city: 'Houston',
        state: 'TX',
        zipcode: '77001',
        skills: ['cooking'],
        preferences: [],
        availability: [],
      },
    ];

    const sortMock = jest.fn().mockResolvedValue(profileDocs);
    UserProfile.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: sortMock,
      }),
    });

    const req = { query: { email: 'bob@example.com' } };
    const res = createMockRes();

    await volunteerController.getProfiles(req, res);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        _id: '2',
        user: expect.objectContaining({ email: 'bob@example.com' }),
      }),
    ]);
  });

  test('handles database errors gracefully', async () => {
    UserProfile.find.mockImplementation(() => {
      throw new Error('db down');
    });

    const req = { query: {} };
    const res = createMockRes();

    await volunteerController.getProfiles(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to load profiles' });
  });
});

describe('volunteerController.createProfile', () => {
  test('rejects when the associated user cannot be found', async () => {
    const req = { body: { email: 'missing@example.com', fullName: 'Missing User' } };
    const res = createMockRes();

    await volunteerController.createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Associated user not found' });
  });

  test('rejects duplicate profiles for the same user', async () => {
    const user = { _id: 'user-1', name: 'Jane', email: 'jane@example.com', role: 'volunteer' };
    UserCredentials.findOne.mockResolvedValueOnce(user);
    UserProfile.findOne.mockResolvedValueOnce({ _id: 'profile-1' });

    const req = { body: { email: 'jane@example.com', fullName: 'Jane' } };
    const res = createMockRes();

    await volunteerController.createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Profile already exists for this user' });
  });

  test('creates a new profile and returns sanitized payload', async () => {
    const user = { _id: 'user-1', name: 'Jane', email: 'jane@example.com', role: 'volunteer' };
    UserCredentials.findOne.mockResolvedValueOnce(user);
    UserProfile.findOne.mockResolvedValueOnce(null);

    UserProfile.mockImplementationOnce((data) => {
      const instance = {
        ...data,
        _id: 'profile-id',
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue({
          _id: 'profile-id',
          user: { _id: 'user-1', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
          fullName: data.fullName,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipcode: data.zipcode || '',
          skills: data.skills || [],
          preferences: data.preferences || [],
          availability: data.availability || [],
        }),
      };
      return instance;
    });

    const req = {
      body: {
        email: 'jane@example.com',
        fullName: 'Jane',
        city: 'Houston',
        skills: ['organizing'],
      },
    };
    const res = createMockRes();

    await volunteerController.createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        fullName: 'Jane',
        city: 'Houston',
        skills: ['organizing'],
        user: expect.objectContaining({
          email: 'jane@example.com',
        }),
      })
    );
  });

  test('allows creating a profile by userId lookup', async () => {
    const user = { _id: 'user-2', name: 'Bill', email: 'bill@example.com', role: 'volunteer' };
    UserCredentials.findById.mockResolvedValueOnce(user);
    UserProfile.findOne.mockResolvedValueOnce(null);

    UserProfile.mockImplementationOnce((data) => {
      const instance = {
        ...data,
        _id: 'profile-2',
        save: jest.fn().mockResolvedValue(undefined),
        populate: jest.fn().mockResolvedValue({
          _id: 'profile-2',
          user: { _id: 'user-2', name: 'Bill', email: 'bill@example.com', role: 'volunteer' },
          fullName: data.fullName,
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipcode: data.zipcode || '',
          skills: data.skills || [],
          preferences: data.preferences || [],
          availability: data.availability || [],
        }),
      };
      return instance;
    });

    const req = {
      body: {
        userId: 'user-2',
        fullName: 'Bill',
        state: 'TX',
      },
    };
    const res = createMockRes();

    await volunteerController.createProfile(req, res);

    expect(UserCredentials.findById).toHaveBeenCalledWith('user-2');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-2',
        fullName: 'Bill',
        state: 'TX',
      })
    );
  });
});

describe('volunteerController.updateProfile', () => {
  test('returns 404 when the profile does not exist', async () => {
    UserProfile.findById.mockResolvedValueOnce(null);
    const req = { params: { id: 'unknown' }, body: { city: 'Dallas' } };
    const res = createMockRes();

    await volunteerController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
  });

  test('persists updates and returns the sanitized document', async () => {
    const doc = {
      _id: 'profile-1',
      user: { _id: 'user-1', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
      fullName: 'Jane',
      address: '',
      city: 'Houston',
      state: 'TX',
      zipcode: '77001',
      skills: [],
      preferences: [],
      availability: [],
      save: jest.fn().mockResolvedValue(undefined),
      populate: jest.fn().mockResolvedValue({
        _id: 'profile-1',
        user: { _id: 'user-1', name: 'Jane', email: 'jane@example.com', role: 'volunteer' },
        fullName: 'Jane Doe',
        address: '',
        city: 'Austin',
        state: 'TX',
        zipcode: '78701',
        skills: ['organizing'],
        preferences: [],
        availability: [],
      }),
    };

    UserProfile.findById.mockResolvedValueOnce(doc);

    const req = { params: { id: 'profile-1' }, body: { fullName: 'Jane Doe', city: 'Austin', skills: ['organizing'] } };
    const res = createMockRes();

    await volunteerController.updateProfile(req, res);

    expect(doc.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'profile-1',
        fullName: 'Jane Doe',
        city: 'Austin',
        skills: ['organizing'],
      })
    );
  });
});

describe('volunteerController.deleteProfile', () => {
  test('returns 404 when the profile does not exist', async () => {
    UserProfile.findByIdAndDelete.mockResolvedValueOnce(null);
    const req = { params: { id: 'missing' } };
    const res = createMockRes();

    await volunteerController.deleteProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Profile not found' });
  });

  test('succeeds when a profile is deleted', async () => {
    UserProfile.findByIdAndDelete.mockResolvedValueOnce({ _id: 'profile-1' });
    const req = { params: { id: 'profile-1' } };
    const res = createMockRes();

    await volunteerController.deleteProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Profile deleted' });
  });
});
