import { ToastHandler } from './toast-handler';

/**
 * LogoutHandler class handles the logout process, including showing confirmation dialogs and redirecting to the login page.
 */
export class LogoutHandler {
  private static readonly REDIRECT_DELAY = 2000;

  /**
   * Handles the logout button click event by showing a confirmation dialog.
   */
  private static handleLogoutClick() {
    //Show confirmation toast
    ToastHandler.showConfirmation(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      () => {
        // On confirm: perform logout
        LogoutHandler.performLogout();
      },
      () => {
        // On cancel: show cancelled message
        ToastHandler.show('info', 'Cancelled', 'Logout cancelled');
      },
    );
  }

  /**
   * Performs the logout process by showing a success message and redirecting to the login page after a delay.
   */
  private static performLogout() {
    // Show toast successful message
    ToastHandler.show('success', 'Success', 'Logging out...');

    // Make some delay
    setTimeout(() => {
      window.location.href = '/login-page.html';
    }, this.REDIRECT_DELAY);
  }

  /**
   * Initializes the LogoutHandler by attaching the click event listener to the logout button.
   */
  public static initialize() {
    const logoutButton = document.querySelector('.sidebar__logout') as HTMLElement;

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        LogoutHandler.handleLogoutClick();
      });
    }
  }
}
