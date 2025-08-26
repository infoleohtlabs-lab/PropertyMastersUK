import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { NotificationType } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const { response } = error;
        
        if (response?.status === 401) {
          // Token expired or invalid
          const authStore = useAuthStore.getState();
          authStore.logout();
          
          useAppStore.getState().addNotification({
            title: 'Session Expired',
            message: 'Please log in again',
            type: NotificationType.WARNING,
            isRead: false
          });
          
          // Redirect to login
          window.location.href = '/login';
        } else if (response?.status === 403) {
          useAppStore.getState().addNotification({
            title: 'Access Denied',
            message: 'You do not have permission to perform this action',
            type: NotificationType.ERROR,
            isRead: false
          });
        } else if (response?.status >= 500) {
          useAppStore.getState().addNotification({
            title: 'Server Error',
            message: 'Something went wrong. Please try again later.',
            type: NotificationType.ERROR,
            isRead: false
          });
        } else if (!response) {
          // Network error
          useAppStore.getState().addNotification({
            title: 'Network Error',
            message: 'Please check your internet connection',
            type: NotificationType.ERROR,
            isRead: false
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    };

    const response = await this.api.post<T>(url, formData, config);
    return response.data;
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const responses = await Promise.allSettled(requests.map(req => req()));
    return responses.map(response => {
      if (response.status === 'fulfilled') {
        return response.value;
      } else {
        throw response.reason;
      }
    });
  }
}

export const apiService = new ApiService();
export default apiService;