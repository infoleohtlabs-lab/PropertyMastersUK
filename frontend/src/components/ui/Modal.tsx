import * as React from 'react';
import { cn } from '../../utils';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  loading?: boolean;
  centered?: boolean;
}

interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
}

interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  divider?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  className,
  overlayClassName,
  loading = false,
  centered = true
}) => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  const variants = {
    default: {
      icon: null,
      headerClass: 'border-secondary-200',
      iconClass: ''
    },
    danger: {
      icon: AlertTriangle,
      headerClass: 'border-danger-200 bg-danger-50',
      iconClass: 'text-danger-600'
    },
    warning: {
      icon: AlertCircle,
      headerClass: 'border-warning-200 bg-warning-50',
      iconClass: 'text-warning-600'
    },
    success: {
      icon: CheckCircle,
      headerClass: 'border-success-200 bg-success-50',
      iconClass: 'text-success-600'
    },
    info: {
      icon: Info,
      headerClass: 'border-primary-200 bg-primary-50',
      iconClass: 'text-primary-600'
    }
  };

  const variantConfig = variants[variant];
  const IconComponent = variantConfig.icon;

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscape);
      }
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (preventScroll) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose, closeOnEscape, preventScroll]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !loading) {
      onClose();
    }
  };

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center p-4',
      !centered && 'items-start pt-16'
    )}>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300',
          'animate-in fade-in-0',
          overlayClassName
        )}
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          'border border-secondary-200',
          sizes[size],
          loading && 'pointer-events-none',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
          </div>
        )}
        
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className={cn(
            'flex items-start justify-between p-6 border-b',
            variantConfig.headerClass
          )}>
            <div className="flex items-start gap-3 flex-1">
              {IconComponent && (
                <div className={cn('mt-0.5', variantConfig.iconClass)}>
                  <IconComponent className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                {title && (
                  <h2 id="modal-title" className="text-xl font-semibold text-secondary-900 leading-tight">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="mt-2 text-sm text-secondary-600 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={loading}
                className="ml-3 p-2 hover:bg-secondary-100 rounded-lg"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className, divider = true }) => (
  <div className={cn(
    'p-6',
    divider && 'border-b border-secondary-200',
    className
  )}>
    {children}
  </div>
);

const ModalBody: React.FC<ModalBodyProps> = ({ children, className, noPadding = false }) => (
  <div className={cn(
    !noPadding && 'p-6',
    className
  )}>
    {children}
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ 
  children, 
  className, 
  divider = true, 
  justify = 'end' 
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };
  
  return (
    <div className={cn(
      'flex items-center gap-3 p-6',
      divider && 'border-t border-secondary-200',
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      variant={variant}
      size="sm"
      closeOnOverlayClick={!loading}
      loading={loading}
    >
      <ModalFooter justify="end">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'destructive' : variant === 'warning' ? 'warning' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmModal };
export type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps, ConfirmModalProps };