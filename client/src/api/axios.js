import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nfc_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 & error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected action, clear stale token
      const isPublicRoute = window.location.pathname.startsWith('/tag/');
      if (!isPublicRoute && window.location.pathname !== '/login') {
        localStorage.removeItem('nfc_auth_token');
        localStorage.removeItem('nfc_user');
        window.location.href = '/login?sessionExpired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
