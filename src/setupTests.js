import '@testing-library/jest-dom';

beforeEach(() => {
  // Ensure clean mocks for every test
  global.fetch = jest.fn();
  if (typeof window !== 'undefined') {
    window.alert = jest.fn();
    if (window.localStorage && typeof window.localStorage.clear === 'function') {
      window.localStorage.clear();
    }
  }
});

afterEach(() => {
  jest.clearAllMocks();
});
