type ToastType = 'success' | 'error' | 'warning' | 'info' | 'confirm';
export default interface ToastOptions {
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
}
