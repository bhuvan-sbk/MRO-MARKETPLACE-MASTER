// frontend/src/services/api.js
import axios from 'axios';
import config from '../config/index';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5300/api', // or process.env.REACT_APP_API_URL
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10
};

// Auth Service
const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => 
    api.post('/auth/reset-password', { token, newPassword })
};

// Hangar Service
const hangarService = {
  create: async (data) => {
    if (data.images) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          data.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, typeof data[key] === 'object' 
            ? JSON.stringify(data[key]) 
            : data[key]
          );
        }
      });
      return api.post('/hangars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/hangars', data);
  },

  getAll: (params = {}) => {
    const finalParams = {
      ...DEFAULT_PAGINATION,
      ...params
    };
    return api.get('/hangars', { params: finalParams });
  },

  getById: (id) => api.get(`/hangars/${id}`),
  update: (id, data) => api.patch(`/hangars/${id}`, data),
  delete: (id) => api.delete(`/hangars/${id}`),
  search: (query) => api.get('/hangars/search', { params: { q: query } }),
  checkAvailability: (id, dates) => 
    api.post(`/hangars/${id}/check-availability`, dates)
};

// Service Service
const serviceService = {
  create: (data) => api.post('/services', data),
  
  getAll: (params = {}) => {
    const finalParams = {
      ...DEFAULT_PAGINATION,
      ...params
    };
    return api.get('/services', { params: finalParams });
  },
  
  getById: (id) => api.get(`/services/${id}`),
  update: (id, data) => api.patch(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getByCategory: (category) => api.get(`/services/category/${category}`)
};

// Booking Service
const bookingService = {
  create: (data) => api.post('/bookings', data),
  
  getAll: (params = {}) => {
    const finalParams = {
      ...DEFAULT_PAGINATION,
      ...params
    };
    return api.get('/bookings', { params: finalParams });
  },
  
  getById: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  getUserBookings: () => api.get('/bookings/user')
};

// Export services and API instance
export {
  api,
  authService,
  hangarService,
  serviceService,
  bookingService
};

// No default export to encourage named imports