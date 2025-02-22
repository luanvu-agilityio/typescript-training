import ToastOptions from '../interfaces/toast-options';
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export const getToastHTML = (
  options: ToastOptions,
  getToastIcon: (type: ToastType) => string,
  getActionButtonsHTML: (options: ToastOptions) => string,
  getProgressBarHTML: () => string,
): string => `
  <div class="toast__icon">
    ${getToastIcon(options.type)}
  </div>
  <div class="toast__content">
    <p class="toast__title">${options.title}</p>
    <p class="toast__message">${options.message}</p>
    ${getActionButtonsHTML(options)}
  </div>
  <button class="toast__close" type="button">&times;</button>
  ${options.type !== 'confirm' ? getProgressBarHTML() : ''}
`;

export const getActionButtonsHTML = (options: ToastOptions): string =>
  options.type === 'confirm'
    ? `<div class="toast__actions">
      <button class="toast__button toast__button--primary" type="button">Confirm</button>
      <button class="toast__button toast__button--secondary" type="button">Cancel</button>
    </div>`
    : '';

export const getProgressBarHTML = (): string => `
  <div class="toast__progress">
    <div class="toast__progress-bar"></div>
  </div>
`;
