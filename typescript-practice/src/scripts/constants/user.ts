import { User } from '../interfaces/user';

export const DUMMY_USERS: User[] = [
  { email: 'user@example.com', password: 'password123' },
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'test@example.com', password: 'test123' },
];

export const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: 'Password must be at least 6 characters',
  FORM_ERRORS: 'Please fix the errors in the form.',
  AUTH_FAILED: 'Invalid email or password. Please try again.',
  AUTH_SUCCESS: 'Login successful! Redirecting to dashboard...',
};
