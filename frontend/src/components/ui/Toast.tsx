import React from 'react';
import { Toaster, toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils';
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

interface ToastMessageProps {
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

// Custom toast components with consistent styling
const ToastSuccess = ({ message, description, action, onDismiss }: ToastMessageProps) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-green-200 rounded-lg shadow-lg">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
      <CheckCircle className="h-4 w-4 text-green-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const ToastError = ({ message, description, action, onDismiss }: ToastMessageProps) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-red-200 rounded-lg shadow-lg">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
      <XCircle className="h-4 w-4 text-red-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const ToastWarning = ({ message, description, action, onDismiss }: ToastMessageProps) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-yellow-200 rounded-lg shadow-lg">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const ToastInfo = ({ message, description, action, onDismiss }: ToastMessageProps) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-blue-200 rounded-lg shadow-lg">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
      <Info className="h-4 w-4 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

const ToastLoading = ({ message, description }: { message: string; description?: string }) => (
  <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
      <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      )}
    </div>
  </div>
);

// Toast utility functions with enhanced options
export const showToast = {
  success: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    onDismiss?: () => void;
  }) => {
    return toast.custom(
      (t) => (
        <ToastSuccess 
          message={message} 
          description={options?.description}
          action={options?.action}
          onDismiss={() => {
            toast.dismiss(t);
            options?.onDismiss?.();
          }}
        />
      ),
      { duration: options?.duration }
    );
  },
  error: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    onDismiss?: () => void;
  }) => {
    return toast.custom(
      (t) => (
        <ToastError 
          message={message} 
          description={options?.description}
          action={options?.action}
          onDismiss={() => {
            toast.dismiss(t);
            options?.onDismiss?.();
          }}
        />
      ),
      { duration: options?.duration }
    );
  },
  warning: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    onDismiss?: () => void;
  }) => {
    return toast.custom(
      (t) => (
        <ToastWarning 
          message={message} 
          description={options?.description}
          action={options?.action}
          onDismiss={() => {
            toast.dismiss(t);
            options?.onDismiss?.();
          }}
        />
      ),
      { duration: options?.duration }
    );
  },
  info: (message: string, options?: {
    description?: string;
    action?: { label: string; onClick: () => void };
    duration?: number;
    onDismiss?: () => void;
  }) => {
    return toast.custom(
      (t) => (
        <ToastInfo 
          message={message} 
          description={options?.description}
          action={options?.action}
          onDismiss={() => {
            toast.dismiss(t);
            options?.onDismiss?.();
          }}
        />
      ),
      { duration: options?.duration }
    );
  },
  loading: (message: string, options?: {
    description?: string;
    duration?: number;
  }) => {
    return toast.custom(
      () => <ToastLoading message={message} description={options?.description} />,
      { duration: options?.duration || Infinity }
    );
  },
  promise: <T,>(promise: Promise<T>, options: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
    loadingDescription?: string;
    successDescription?: string | ((data: T) => string);
    errorDescription?: string | ((error: any) => string);
  }) => {
    return toast.promise(promise, {
      loading: () => (
        <ToastLoading 
          message={options.loading} 
          description={options.loadingDescription}
        />
      ),
      success: (data) => {
        const message = typeof options.success === 'function' ? options.success(data) : options.success;
        const description = typeof options.successDescription === 'function' 
          ? options.successDescription(data) 
          : options.successDescription;
        return <ToastSuccess message={message} description={description} />;
      },
      error: (error) => {
        const message = typeof options.error === 'function' ? options.error(error) : options.error;
        const description = typeof options.errorDescription === 'function' 
          ? options.errorDescription(error) 
          : options.errorDescription;
        return <ToastError message={message} description={description} />;
      },
    });
  },
  custom: (component: React.ReactNode, options?: { duration?: number }) => {
    return toast.custom(() => component, options);
  },
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },
  dismissAll: () => {
    toast.dismiss();
  },
  
  // Helper to show toast based on notification type
  fromType: (type: NotificationType, message: string, description?: string) => {
    switch (type) {
      case NotificationType.SUCCESS:
        showToast.success(message, { description });
        break;
      case NotificationType.ERROR:
        showToast.error(message, { description });
        break;
      case NotificationType.WARNING:
        showToast.warning(message, { description });
        break;
      case NotificationType.INFO:
        showToast.info(message, { description });
        break;
      default:
        showToast.info(message, { description });
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
  CustomToast,
  LoadingToast,
  ToastSuccess,
  ToastError,
  ToastWarning,
  ToastInfo,
  ToastLoading
};
export type { ToastProps };