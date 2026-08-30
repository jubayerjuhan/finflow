import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase/client';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach the current Firebase ID token, if signed in
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Firebase not configured yet, or token fetch failed — send the
      // request unauthenticated and let the API respond with 401.
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    if (typeof window !== 'undefined') {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
