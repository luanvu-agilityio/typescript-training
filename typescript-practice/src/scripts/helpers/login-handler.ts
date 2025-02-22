import { ToastHandler } from './toast-handler';
import { validateForm, authenticate, clearError } from './login-validator';
import { ERROR_MESSAGES } from '../constants/user';

// Get DOM elements
const loginForm = document.querySelector('.card__form') as HTMLFormElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

// Add form submit event listener
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

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
    }
  } else {
    // Form validation failed - show warning toast
    ToastHandler.show('warning', 'Warning!', ERROR_MESSAGES.FORM_ERRORS);
  }
});

// Add input event listeners to clear errors on input
emailInput.addEventListener('input', () => clearError(emailInput));
passwordInput.addEventListener('input', () => clearError(passwordInput));
