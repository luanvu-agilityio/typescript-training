// @ts-expect-error
import successIcon from '../../assets/icons/toast-message-icons/success.png';
// @ts-expect-error
import warningIcon from '../../assets/icons/toast-message-icons/warning.png';
// @ts-expect-error
import errorIcon from '../../assets/icons/toast-message-icons/error.png';
// @ts-expect-error
import infoIcon from '../../assets/icons/toast-message-icons/info.png';
// @ts-expect-error
import confirmIcon from '../../assets/icons/toast-message-icons/warning.png';

export const ICON = {
  success: `<img src="${successIcon}" alt="success">`,
  error: `<img src="${errorIcon}" alt="error">`,
  warning: `<img src="${warningIcon}" alt="warning">`,
  info: `<img src="${infoIcon}" alt="info">`,
  confirm: `<img src="${confirmIcon}" alt="confirm">`,
} as const;
