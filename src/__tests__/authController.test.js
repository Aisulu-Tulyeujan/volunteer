/** @jest-environment node */

const mockUserCredentialsConstructor = jest.fn();
mockUserCredentialsConstructor.findOne = jest.fn();
mockUserCredentialsConstructor.findById = jest.fn();

const mockUserProfileConstructor = jest.fn();
mockUserProfileConstructor.findOne = jest.fn();

jest.mock('../../server/models/UserCredentials', () => mockUserCredentialsConstructor);
jest.mock('../../server/models/UserProfile', () => mockUserProfileConstructor);

const mockPasswordUtils = {
  encryptPassword: jest.fn(),
  checkPassword: jest.fn(),
};
jest.mock('../../server/utils/passwordUtils', () => mockPasswordUtils);

const mockBcrypt = {
  compare: jest.fn(),
};
jest.mock('bcryptjs', () => mockBcrypt);

const authController = require('../../server/controllers/authController');
const UserCredentials = require('../../server/models/UserCredentials');
const UserProfile = require('../../server/models/UserProfile');

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
  return res;
};

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(() => {
  jest.clearAllMocks();

  UserCredentials.mockImplementation((data) => {
    const instance = {
      ...data,
      _id: 'generated-user-id',
      save: jest.fn().mockResolvedValue(undefined),
    };
    return instance;
  });

  UserProfile.mockImplementation((data) => {
    const instance = {
      ...data,
      _id: 'generated-profile-id',
      save: jest.fn().mockResolvedValue(undefined),
    };
    return instance;
  });

  UserCredentials.findOne.mockResolvedValue(null);
  UserCredentials.findById.mockResolvedValue(null);
  UserProfile.findOne.mockResolvedValue(null);

  mockPasswordUtils.encryptPassword.mockResolvedValue('hashed-password');
  mockBcrypt.compare.mockResolvedValue(false);
});

describe('authController.register', () => {
  test('returns validation errors when required fields are missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = createMockRes();

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe('Validation failed');
    expect(res.json.mock.calls[0][0].errors).toHaveProperty('name');
  });

  test('rejects duplicate registrations for the same email', async () => {
    UserCredentials.findOne.mockResolvedValueOnce({ _id: 'existing-id' });
    const req = { body: { name: 'Sam', email: 'sam@example.com', password: 'secret123' } };
    const res = createMockRes();

    await authController.register(req, res);

    expect(UserCredentials.findOne).toHaveBeenCalledWith({ email: 'sam@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  test('creates credentials and profile when data is valid', async () => {
    UserCredentials.findOne.mockResolvedValueOnce(null);
    const savedUserInstances = [];
    UserCredentials.mockImplementation((data) => {
      const instance = {
        ...data,
        _id: 'new-user-id',
        save: jest.fn().mockResolvedValue(undefined),
      };
      savedUserInstances.push(instance);
      return instance;
    });

    const profileSaves = [];
    UserProfile.mockImplementation((data) => {
      const instance = {
        ...data,
        save: jest.fn().mockImplementation(async () => {
          profileSaves.push({ ...instance });
        }),
      };
      return instance;
    });

    const req = { body: { name: 'Dana', email: 'dana@example.com', password: 'secret123' } };
    const res = createMockRes();

    await authController.register(req, res);

    expect(mockPasswordUtils.encryptPassword).toHaveBeenCalledWith('secret123');
    expect(savedUserInstances[0]).toMatchObject({
      name: 'Dana',
      email: 'dana@example.com',
      password: 'hashed-password',
    });
    expect(profileSaves[0]).toMatchObject({
      user: 'new-user-id',
      fullName: 'Dana',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered successfully (credentials + initial profile created)',
      userId: 'new-user-id',
    });
  });
});

describe('authController.login', () => {
  test('requires both email and password', async () => {
    const req = { body: { email: 'test@example.com' } };
    const res = createMockRes();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required.' });
  });

  test('fails when user cannot be found', async () => {
    UserCredentials.findOne.mockResolvedValueOnce(null);
    const req = { body: { email: 'sam@example.com', password: 'secret123' } };
    const res = createMockRes();

    await authController.login(req, res);

    expect(UserCredentials.findOne).toHaveBeenCalledWith({ email: 'sam@example.com' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  test('fails when password comparison does not match', async () => {
    UserCredentials.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      email: 'sam@example.com',
      name: 'Sam',
      role: 'volunteer',
      password: 'hashed',
    });
    mockBcrypt.compare.mockResolvedValueOnce(false);
    const req = { body: { email: 'sam@example.com', password: 'wrong' } };
    const res = createMockRes();

    await authController.login(req, res);

    expect(mockBcrypt.compare).toHaveBeenCalledWith('wrong', 'hashed');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  test('returns a jwt when credentials are valid', async () => {
    UserCredentials.findOne.mockResolvedValueOnce({
      _id: 'user-id',
      email: 'sam@example.com',
      name: 'Sam',
      role: 'volunteer',
      password: 'hashed',
    });
    mockBcrypt.compare.mockResolvedValueOnce(true);
    const req = { body: { email: 'sam@example.com', password: 'secret123' } };
    const res = createMockRes();

    await authController.login(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Login successful',
      token: expect.any(String),
      user: {
        id: 'user-id',
        email: 'sam@example.com',
        name: 'Sam',
        role: 'volunteer',
      },
    });
  });
});
