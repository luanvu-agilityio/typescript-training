import { ToastHandler } from './toast-handler';
import { validateForm, authenticate, clearError } from './login-validator';
import { ERROR_MESSAGES } from '../constants/user';
import { LoadingSpinner } from './loading-spinner';

// Get DOM elements
const loginForm = document.querySelector('.card__form') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

/**
 * Handles the login form submission
 * Validates form, authenticates the user and provides info feedback via toast
 */
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Show loading spinner
  LoadingSpinner.getInstance().show();
  try {
    if (validateForm(emailInput, passwordInput)) {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (authenticate(email, password)) {
        // Success - show toast and redirect
        ToastHandler.show('success', 'Success!', ERROR_MESSAGES.AUTH_SUCCESS);

        // Store a token in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);

        // Redirect to main page after toast is shown
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 3000);
      } else {
        // Failed authentication - show error toast
        ToastHandler.show('error', 'Error!', ERROR_MESSAGES.AUTH_FAILED);

        // Clear password field
        passwordInput.value = '';
        LoadingSpinner.getInstance().hide();
      }
    } else {
      // Form validation failed - show warning toast
      ToastHandler.show('warning', 'Warning!', ERROR_MESSAGES.FORM_ERRORS);
      LoadingSpinner.getInstance().hide();
    }
  } catch (error) {
    // Handle any unexpected errors
    ToastHandler.show('error', 'Error!', 'An unexpected error occurred');

    // Hide the spinner
    LoadingSpinner.getInstance().hide();
  }
});

/**
 * Clears error messages when user starts typing in the email input field
 */
emailInput.addEventListener('input', () => clearError(emailInput));

/**
 * Clears error messages when user starts typing in the password input field
 */
passwordInput.addEventListener('input', () => clearError(passwordInput));
