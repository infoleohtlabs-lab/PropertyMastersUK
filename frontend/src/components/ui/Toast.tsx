import React from 'react';
import { Toaster, toast } from 'sonner';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { NotificationType } from '../../types';

interface ToastProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  theme?: 'light' | 'dark' | 'system';
  richColors?: boolean;
  closeButton?: boolean;
}

const ToastProvider: React.FC<ToastProps> = ({
  position = 'top-right',
  theme = 'light',
  richColors = true,
  closeButton = true
}) => {
  return (
    <Toaster
      position={position}
      theme={theme}
      richColors={richColors}
      closeButton={closeButton}
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#374151'
        },
        className: 'toast',
        duration: 4000
      }}
    />
  );
};

// Toast utility functions
const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="h-4 w-4" />
    });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="h-4 w-4" />
    });
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-4 w-4" />
    });
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="h-4 w-4" />
    });
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error
    });
  },
  
  custom: (component: (id: string | number) => React.ReactElement, options?: any) => {
    return toast.custom(component, options);
  },
  
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
  
  // Helper to show toast based on notification type
  fromType: (type: NotificationType, message: string, description?: string) => {
    switch (type) {
      case NotificationType.SUCCESS:
        showToast.success(message, description);
        break;
      case NotificationType.ERROR:
        showToast.error(message, description);
        break;
      case NotificationType.WARNING:
        showToast.warning(message, description);
        break;
      case NotificationType.INFO:
        showToast.info(message, description);
        break;
      default:
        showToast.info(message, description);
    }
  }
};

// Custom toast components
const CustomToast: React.FC<{
  title: string;
  description?: string;
  type: NotificationType;
  onClose?: () => void;
}> = ({ title, description, type, onClose }) => {
  const icons = {
    [NotificationType.SUCCESS]: <CheckCircle className="h-5 w-5 text-green-500" />,
    [NotificationType.ERROR]: <XCircle className="h-5 w-5 text-red-500" />,
    [NotificationType.WARNING]: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    [NotificationType.INFO]: <Info className="h-5 w-5 text-blue-500" />
  };

  const bgColors = {
    [NotificationType.SUCCESS]: 'bg-green-50 border-green-200',
    [NotificationType.ERROR]: 'bg-red-50 border-red-200',
    [NotificationType.WARNING]: 'bg-yellow-50 border-yellow-200',
    [NotificationType.INFO]: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className={`flex items-start p-4 rounded-lg border ${bgColors[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-gray-600">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Loading toast component
const LoadingToast: React.FC<{
  message: string;
}> = ({ message }) => (
  <div className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-sm text-gray-900">{message}</span>
  </div>
);

export {
  ToastProvider,
  showToast,
  CustomToast,
  LoadingToast
};
export type { ToastProps };