import '@testing-library/jest-dom';

beforeEach(() => {
  // Ensure clean mocks for every test
  global.fetch = jest.fn();
  window.alert = jest.fn();
  window.localStorage.clear();
});

afterEach(() => {
  jest.clearAllMocks();
});
