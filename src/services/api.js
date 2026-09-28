// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transit_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for response handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Export domain API helpers
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
};

export const transportTypesApi = {
  getAll: () => api.get('/transport-types'),
  getById: (id) => api.get(`/transport-types/${id}`),
  create: (data) => api.post('/transport-types', data),
  update: (id, data) => api.put(`/transport-types/${id}`, data),
  delete: (id) => api.delete(`/transport-types/${id}`),
};

export const vehiclesApi = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const routesApi = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
  assignStops: (id, stops) => api.post(`/routes/${id}/stops`, { stops }),
};

export const stopsApi = {
  getAll: () => api.get('/stops'),
  getById: (id) => api.get(`/stops/${id}`),
  create: (data) => api.post('/stops', data),
  update: (id, data) => api.put(`/stops/${id}`, data),
  delete: (id) => api.delete(`/stops/${id}`),
  getNearby: (lat, lng, radius_km = 5) => api.get('/stops/nearby', { params: { lat, lng, radius_km } }),
};

export const schedulesApi = {
  getAll: (params) => api.get('/schedules', { params }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
};

export const trackingApi = {
  getVehicles: () => api.get('/tracking/vehicles'),
  getVehicleById: (id) => api.get(`/tracking/vehicles/${id}`),
  getRouteTracking: (routeId) => api.get(`/tracking/routes/${routeId}`),
  postLocation: (data) => api.post('/tracking/location', data),
  startTrip: (data) => api.post('/tracking/trips/start', data),
  endTrip: (data) => api.post('/tracking/trips/end', data),
  toggleSimulator: () => api.post('/tracking/simulator/toggle'),
  getSimulatorStatus: () => api.get('/tracking/simulator/status'),
};

export const journeysApi = {
  search: (params) => api.get('/journeys/search', { params }),
  getAlternatives: (params) => api.get('/journeys/alternatives', { params }),
};

export const analyticsApi = {
  getSummary: () => api.get('/analytics/summary'),
  getDelays: (params) => api.get('/analytics/delays', { params }),
  getPunctuality: (tolerance = 5) => api.get('/analytics/punctuality', { params: { tolerance } }),
  getScheduledVsActual: () => api.get('/analytics/scheduled-vs-actual'),
  getDailyFrequency: () => api.get('/analytics/daily-frequency'),
  getDelayDistribution: () => api.get('/analytics/delay-distribution'),
  getTransportUsage: () => api.get('/analytics/transport-usage'),
  getPeakHours: () => api.get('/analytics/peak-hours'),
};

export const alertsApi = {
  getActive: () => api.get('/alerts'),
  getAll: () => api.get('/alerts/all'),
  create: (data) => api.post('/alerts', data),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const favoritesApi = {
  getFavorites: () => api.get('/favorites'),
  addFavorite: (route_id) => api.post('/favorites', { route_id }),
  removeFavorite: (routeId) => api.delete(`/favorites/${routeId}`),
};

export default api;
