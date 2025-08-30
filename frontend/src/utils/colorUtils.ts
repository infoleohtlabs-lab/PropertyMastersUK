/**
 * Utility functions for consistent color styling across the application
 */

// Priority color mappings
export const getPriorityColors = (priority: string) => {
  const normalizedPriority = priority.toLowerCase();
  
  switch (normalizedPriority) {
    case 'low':
      return {
        bg: 'bg-success-100',
        text: 'text-success-800',
        border: 'border-success-200',
        dot: 'bg-success-500'
      };
    case 'medium':
      return {
        bg: 'bg-warning-100',
        text: 'text-warning-800',
        border: 'border-warning-200',
        dot: 'bg-warning-500'
      };
    case 'high':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        dot: 'bg-orange-500'
      };
    case 'urgent':
    case 'critical':
    case 'emergency':
      return {
        bg: 'bg-danger-100',
        text: 'text-danger-800',
        border: 'border-danger-200',
        dot: 'bg-danger-500'
      };
    default:
      return {
        bg: 'bg-secondary-100',
        text: 'text-secondary-800',
        border: 'border-secondary-200',
        dot: 'bg-secondary-500'
      };
  }
};

// Status color mappings
export const getStatusColors = (status: string) => {
  const normalizedStatus = status.toLowerCase().replace(/[_\s]/g, '');
  
  switch (normalizedStatus) {
    case 'active':
    case 'approved':
    case 'completed':
    case 'success':
    case 'confirmed':
    case 'paid':
      return {
        bg: 'bg-success-100',
        text: 'text-success-800',
        border: 'border-success-200',
        dot: 'bg-success-500'
      };
    case 'pending':
    case 'inprogress':
    case 'processing':
    case 'scheduled':
    case 'ongoing':
      return {
        bg: 'bg-warning-100',
        text: 'text-warning-800',
        border: 'border-warning-200',
        dot: 'bg-warning-500'
      };
    case 'cancelled':
    case 'rejected':
    case 'failed':
    case 'expired':
    case 'overdue':
    case 'blocked':
      return {
        bg: 'bg-danger-100',
        text: 'text-danger-800',
        border: 'border-danger-200',
        dot: 'bg-danger-500'
      };
    case 'draft':
    case 'inactive':
    case 'paused':
    case 'disabled':
      return {
        bg: 'bg-secondary-100',
        text: 'text-secondary-800',
        border: 'border-secondary-200',
        dot: 'bg-secondary-500'
      };
    case 'review':
    case 'needsattention':
    case 'requiresaction':
      return {
        bg: 'bg-primary-100',
        text: 'text-primary-800',
        border: 'border-primary-200',
        dot: 'bg-primary-500'
      };
    default:
      return {
        bg: 'bg-secondary-100',
        text: 'text-secondary-800',
        border: 'border-secondary-200',
        dot: 'bg-secondary-500'
      };
  }
};

// Legacy function for backward compatibility
export const getPriorityColor = (priority: string): string => {
  const colors = getPriorityColors(priority);
  return `${colors.text} ${colors.bg}`;
};

// Legacy function for backward compatibility
export const getStatusColor = (status: string): string => {
  const colors = getStatusColors(status);
  return `${colors.text} ${colors.bg}`;
};

// Role-based color mappings
export const getRoleColors = (role: string) => {
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'admin':
    case 'administrator':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-500'
      };
    case 'agent':
    case 'broker':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'landlord':
    case 'owner':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500'
      };
    case 'tenant':
    case 'renter':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-200',
        dot: 'bg-orange-500'
      };
    case 'buyer':
    case 'client':
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        dot: 'bg-indigo-500'
      };
    case 'solicitor':
    case 'lawyer':
    case 'legal':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        dot: 'bg-gray-500'
      };
    case 'contractor':
    case 'maintenance':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
      };
    default:
      return {
        bg: 'bg-secondary-100',
        text: 'text-secondary-800',
        border: 'border-secondary-200',
        dot: 'bg-secondary-500'
      };
  }
};

// Property type color mappings
export const getPropertyTypeColors = (type: string) => {
  const normalizedType = type.toLowerCase();
  
  switch (normalizedType) {
    case 'house':
    case 'detached':
    case 'semidetached':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500'
      };
    case 'apartment':
    case 'flat':
    case 'condo':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      };
    case 'commercial':
    case 'office':
    case 'retail':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-500'
      };
    case 'land':
    case 'plot':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500'
      };
    default:
      return {
        bg: 'bg-secondary-100',
        text: 'text-secondary-800',
        border: 'border-secondary-200',
        dot: 'bg-secondary-500'
      };
  }
};

// Utility function to combine multiple color classes
export const combineColorClasses = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Utility function to get contrasting text color
export const getContrastingTextColor = (backgroundColor: string): string => {
  // Simple implementation - in a real app, you might want to calculate luminance
  const darkBackgrounds = ['bg-gray-800', 'bg-gray-900', 'bg-black'];
  return darkBackgrounds.some(bg => backgroundColor.includes(bg)) ? 'text-white' : 'text-gray-900';
};