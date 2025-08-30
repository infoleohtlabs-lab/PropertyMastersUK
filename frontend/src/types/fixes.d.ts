
// Temporary type fixes for PropertyMasters UK

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

// Extend Window interface for global variables
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Common API response type
interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Input component props extension
interface InputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export {};
