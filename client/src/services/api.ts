import axios from 'axios';
import mockAdapter from './mockAdapter.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const isMockMode =
  window.location.hostname.endsWith('github.io') ||
  localStorage.getItem('use_mock_api') === 'true' ||
  import.meta.env.VITE_USE_MOCK === 'true';

if (isMockMode && localStorage.getItem('use_mock_api') !== 'false') {
  localStorage.setItem('use_mock_api', 'true');
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: isMockMode ? mockAdapter : undefined,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('expense_tracker_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('expense_tracker_token');
      const base = window.location.pathname.startsWith('/expense-tracker') ? '/expense-tracker' : '';
      if (window.location.pathname !== `${base}/login` && window.location.pathname !== `${base}/register`) {
        window.location.href = `${base}/login`;
      }
    }
    return Promise.reject(error);
  }
);
