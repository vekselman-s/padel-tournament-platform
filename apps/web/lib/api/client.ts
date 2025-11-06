import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL } from '@/lib/constants';

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          // Handle 401 Unauthorized
          if (error.response.status === 401) {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              window.location.href = '/auth/login';
            }
          }

          // Return structured error
          return Promise.reject({
            message: error.response.data?.message || 'Ocurrió un error',
            statusCode: error.response.status,
            errors: error.response.data?.errors,
          } as ApiError);
        }

        // Network error
        return Promise.reject({
          message: 'Error de conexión. Por favor, verifica tu conexión a internet.',
          statusCode: 0,
        } as ApiError);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getInstance();
