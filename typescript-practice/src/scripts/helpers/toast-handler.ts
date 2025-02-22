import ToastOptions from '../interfaces/toast-options';
import { getToastHTML, getActionButtonsHTML, getProgressBarHTML } from '../templates/toast';
import { ICON } from '../constants/toast-icon-src';
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export class ToastHandler {
  private static readonly DEFAULT_DURATION = 3000;
  private static readonly ANIMATION_DURATION = 500;

  private static readonly ICON = ICON;

  private static getToastContainer(): HTMLDivElement {
    let container = document.querySelector('.toast-container') as HTMLDivElement;
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  private static getToastIcon(type: ToastType): string {
    return this.ICON[type === 'confirm' ? 'warning' : type];
  }

  private static createToastElement(options: ToastOptions): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = ` toast toast--${options.type === 'confirm' ? 'info' : options.type}`;

    const iconSrc = options.type === 'confirm' ? 'warning' : options.type;

    toast.innerHTML = getToastHTML(
      options,
      this.getToastIcon.bind(this),
      getActionButtonsHTML,
      getProgressBarHTML,
    );
    return toast;
  }

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

  private static removeToast(toast: HTMLDivElement, onComplete?: () => void): void {
    // Clear any existing timeouts attached to this toast
    const timeoutId = parseInt(toast.dataset.timeoutId || '0');
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    toast.classList.add('toast-removing');

    setTimeout(() => {
      toast.remove();

      const container = this.getToastContainer();
      if (container && container.children.length === 0) {
        container.remove();
      }
      onComplete?.();
    }, this.ANIMATION_DURATION);
  }

  private static setupEventListeners(
    toast: HTMLDivElement,
    options: ToastOptions,
    duration: number,
  ): void {
    //Setup close button
    const closeBtn = toast.querySelector('.toast__close') as HTMLButtonElement;
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (options.type === 'confirm') {
          options.onCancel?.();
        }
        this.removeToast(toast);
      });
    }

    //Setup confirmation button
    if (options.type === 'confirm') {
      const confirmBtn = toast.querySelector('.toast__button--primary') as HTMLButtonElement;
      const cancelBtn = toast.querySelector('.toast__button--secondary') as HTMLButtonElement;

      confirmBtn?.addEventListener('click', () => {
        options.onConfirm?.();
        this.removeToast(toast);
      });

      cancelBtn?.addEventListener('click', () => {
        options.onCancel?.();
        this.removeToast(toast);
      });
    } else {
      // Set auto remove for non confirmation toast
      const timeoutId = setTimeout(() => {
        if (document.body.contains(toast)) {
          this.removeToast(toast);
        }
      }, duration);

      //Store timeout ID on the toast element
      toast.dataset.timeoutId = timeoutId.toString();
    }
  }

  static show(type: ToastType, title: string, message: string): void {
    this.createToast({ type, title, message });
  }
  static showConfirmation(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
  ): void {
    this.createToast({
      type: 'confirm',
      title,
      message,
      onConfirm,
      onCancel,
    });
  }

  private static createToast(options: ToastOptions): void {
    const duration = options.duration ?? this.DEFAULT_DURATION;
    const container = this.getToastContainer();
    const toast = this.createToastElement(options);

    container.appendChild(toast);

    if (options.type !== 'confirm') {
      this.setProgressBar(toast, duration);
    }
    this.setupEventListeners(toast, options, duration);
  }
}
