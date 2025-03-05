type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';
export default interface IToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}
