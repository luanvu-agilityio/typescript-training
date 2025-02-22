import { DUMMY_USERS, ERROR_MESSAGES } from '../constants/user';
import { User } from '../interfaces/user';

/**
 * Function to validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Function to show error message
 */
export function showError(input: HTMLInputElement, message: string): void {
  // Remove any existing error
  const existingError = input.parentElement?.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Create inline error element
  const errorElement = document.createElement('p');
  errorElement.className = 'error-message';
  errorElement.textContent = message;

  // Insert error after input
  input.parentElement?.appendChild(errorElement);

  // Highlight input
  input.style.borderColor = 'red';
}

/**
 * Function to clear error
 */
export function clearError(input: HTMLInputElement): void {
  const errorElement = input.parentElement?.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
  input.style.borderColor = '';
}

/**
 * Function to validate form fields
 */
export function validateForm(
  emailInput: HTMLInputElement,
  passwordInput: HTMLInputElement,
): boolean {
  let isValid = true;

  // Validate email
  if (!emailInput.value.trim()) {
    showError(emailInput, ERROR_MESSAGES.EMAIL_REQUIRED);
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    showError(emailInput, ERROR_MESSAGES.EMAIL_INVALID);
    isValid = false;
  } else {
    clearError(emailInput);
  }

  // Validate password
  if (!passwordInput.value) {
    showError(passwordInput, ERROR_MESSAGES.PASSWORD_REQUIRED);
    isValid = false;
  } else if (passwordInput.value.length < 6) {
    showError(passwordInput, ERROR_MESSAGES.PASSWORD_LENGTH);
    isValid = false;
  } else {
    clearError(passwordInput);
  }

  return isValid;
}

/**
 * Function to authenticate user
 */
export function authenticate(email: string, password: string): boolean {
  return DUMMY_USERS.some((user) => user.email === email && user.password === password);
}
