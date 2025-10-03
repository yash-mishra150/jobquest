import axios, { AxiosError, AxiosInstance } from 'axios';

// Create a base axios instance with common configuration
const baseApi: AxiosInstance = axios.create({
  baseURL: '/', // Base URL is relative to prevent exposing the actual backend
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request interceptor
baseApi.interceptors.request.use(
  (config) => {
    // You could add auth tokens here in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
baseApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common error cases
    return Promise.reject(error);
  }
);

export default baseApi;