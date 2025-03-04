import ToastOptions from '../interfaces/toast-options';
import { getToastHTML, getActionButtonsHTML, getProgressBarHTML } from '../templates/toast';
import { ICON } from '../constants/toast-icon-src';
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

/**
 * ToastHandler class manages the display of toast notifications on the web page.
 * It provides methods to show different types of toasts, including confirmation dialogs.
 */
export class ToastHandler {
  private static readonly DEFAULT_DURATION = 3000;
  private static readonly ANIMATION_DURATION = 500;

  private static readonly ICON = ICON;

  /**
   * Gets the toast container element, creating it if it doesn't already exist.
   * @returns The toast container element.
   */
  private static getToastContainer(isConfirmation: boolean = false): HTMLDivElement {
    // Identify if this is a confirmation (for deletion) dialog or a toast
    const selector = isConfirmation ? '.confirm-dialog-container' : '.toast-container';

    let container = document.querySelector(selector) as HTMLDivElement;
    if (!container) {
      container = document.createElement('div');
      container.className = isConfirmation ? 'confirm-dialog-container' : 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Get the icon url for a given toast type
   * @param type - type of toast
   * @return icon url
   */
  private static getToastIcon(type: ToastType): string {
    return this.ICON[type === 'confirm' ? 'warning' : type];
  }

  /**
   * Create toast element based on provided options
   * @param options - options for the toast
   * @return the created toast element
   */
  private static createToastElement(options: ToastOptions): HTMLDivElement {
    const toast = document.createElement('div');

    if (options.type === 'confirm') {
      toast.className = 'confirm-dialog confirm-dialog--warning';
    } else {
      toast.className = `toast toast--${options.type}`;
    }

    toast.innerHTML = getToastHTML(
      options,
      this.getToastIcon.bind(this),
      getActionButtonsHTML,
      getProgressBarHTML,
    );
    return toast;
  }

  /**
   *  Sets up the progress bar toast element
   * @param toast -toast element
   * @param duration - duration for the progress bar
   */
  private static setProgressBar(toast: HTMLDivElement, duration: number): void {
    const progressBar = toast.querySelector('.toast__progress-bar') as HTMLDivElement;
    if (!progressBar) return;

    // Set initial width
    progressBar.style.width = '100%';

    // Add transition
    requestAnimationFrame(() => {
      progressBar.style.transition = `width ${duration}ms linear`;
      progressBar.style.width = '0%';
    });
  }

  /**
   * Remove toast element from the DOM
   * @param toast - the toast to remove
   * @param isConfirmation - whether this is a confirmation dialog
   * @param onComplete - optional callback to execute after the toast is removed
   */
  private static removeToast(
    toast: HTMLDivElement,
    isConfirmation: boolean = false,
    onComplete?: () => void,
  ): void {
    // Clear any existing timeouts attached to this toast
    const timeoutId = parseInt(toast.dataset.timeoutId || '0');
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    toast.classList.add(isConfirmation ? 'confirm-dialog-removing' : 'toast-removing');

    setTimeout(() => {
      toast.remove();

      const container = this.getToastContainer(isConfirmation);
      if (container && container.children.length === 0) {
        container.remove();
      }
      onComplete?.();
    }, this.ANIMATION_DURATION);
  }

  /**
   *  Sets up the event listener for a toast element
   * @param toast - toast element
   * @param options - the options for the toast
   * @param duration - the duration for the toast
   * @param isConfirmation - whether this is a confirmation dialog
   */
  private static setupEventListeners(
    toast: HTMLDivElement,
    options: ToastOptions,
    duration: number,
    isConfirmation: boolean = false,
  ): void {
    //Setup close button
    const closeBtn = toast.querySelector('.toast__close') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (options.type === 'confirm') {
          options.onCancel?.();
        }
        this.removeToast(toast, isConfirmation);
      });
    }

    //Setup confirmation button
    if (options.type === 'confirm') {
      const confirmBtn = toast.querySelector('.toast__button--primary') as HTMLButtonElement;
      const cancelBtn = toast.querySelector('.toast__button--secondary') as HTMLButtonElement;

      confirmBtn?.addEventListener('click', () => {
        options.onConfirm?.();
        this.removeToast(toast, isConfirmation);
      });

      cancelBtn?.addEventListener('click', () => {
        options.onCancel?.();
        this.removeToast(toast, isConfirmation);
      });
    } else {
      // Set auto remove for non confirmation toast
      const timeoutId = setTimeout(() => {
        if (document.body.contains(toast)) {
          this.removeToast(toast, isConfirmation);
        }
      }, duration);

      //Store timeout ID on the toast element
      toast.dataset.timeoutId = timeoutId.toString();
    }
  }

  /**
   *  Shows the toast notification
   *  @param type - the type of toast (success, error, warning, info)
   * @param title - the title of the toast
   * @param message -  the message of the toast
   */
  static show(type: ToastType, title: string, message: string): void {
    this.createToast({ type, title, message }, false);
  }

  /**
   * Shows a confirmation toast with options to confirm or cancel
   * @param title - the title of the toast
   * @param message - the message of the toast
   * @param onConfirm - callback function to execute on confirm
   * @param onCancel -  callback function to execute on cancel.
   */
  static showConfirmation(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
  ): void {
    // Create an overlay for the popup
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    document.body.appendChild(overlay);

    // Create the toast with the additional overlay reference
    this.createToast(
      {
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          onConfirm();
          overlay.remove();
        },
        onCancel: () => {
          onCancel();
          overlay.remove();
        },
      },
      true,
    );
  }

  /**
   * Creates and displays a toast notification based on provided options
   * @param options - options for the toast
   * @param isConfirmation - whether this is a confirmation dialog
   */
  private static createToast(options: ToastOptions, isConfirmation: boolean = false): void {
    const duration = options.duration ?? this.DEFAULT_DURATION;
    const container = this.getToastContainer(isConfirmation);
    const toast = this.createToastElement(options);

    container.appendChild(toast);

    if (options.type !== 'confirm') {
      this.setProgressBar(toast, duration);
    }

    this.setupEventListeners(toast, options, duration, isConfirmation);
  }
}
