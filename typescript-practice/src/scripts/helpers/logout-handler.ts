import { ToastHandler } from './toast-handler';

export class LogoutHandler {
  private static readonly REDIRECT_DELAY = 2000;

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

  private static performLogout() {
    // Show toast successful message
    ToastHandler.show('success', 'Success', 'Logging out...');

    // Make some delay
    setTimeout(() => {
      window.location.href = 'login-page.html';
    }, this.REDIRECT_DELAY);
  }

  public static initialize() {
    const logoutButton = document.querySelector('.sidebar__logout') as HTMLElement;

    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        LogoutHandler.handleLogoutClick();
      });
    }
  }
}
