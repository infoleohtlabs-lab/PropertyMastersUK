// Toast utility for showing notifications
export const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  // Simple console log implementation for now
  // In a real app, this would integrate with a toast library like react-hot-toast or sonner
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // You can replace this with actual toast implementation
  // For example, using react-hot-toast:
  // import toast from 'react-hot-toast';
  // switch (type) {
  //   case 'success':
  //     toast.success(message);
  //     break;
  //   case 'error':
  //     toast.error(message);
  //     break;
  //   case 'warning':
  //     toast(message, { icon: '⚠️' });
  //     break;
  //   default:
  //     toast(message);
  // }
};

export const showSuccessToast = (message: string) => showToast(message, 'success');
export const showErrorToast = (message: string) => showToast(message, 'error');
export const showWarningToast = (message: string) => showToast(message, 'warning');
export const showInfoToast = (message: string) => showToast(message, 'info');