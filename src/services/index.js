import { apiClient } from './api';

export const authService = {
  login: async (email, password) => apiClient.post('/auth/login', { email, password }),
  register: async (userData) => apiClient.post('/auth/register', userData),
  forgotPassword: async (email) => apiClient.post('/auth/forgot-password', { email }),
};

export const propertyService = {
  getAll: async () => apiClient.get('/properties'),
  getById: async (id) => apiClient.get(`/properties/${id}`),
  create: async (data) => apiClient.post('/properties', data),
  update: async (id, data) => apiClient.put(`/properties/${id}`, data),
  delete: async (id) => apiClient.delete(`/properties/${id}`),
};

export const roomService = {
  getAll: async () => apiClient.get('/rooms'),
  getById: async (id) => apiClient.get(`/rooms/${id}`),
  create: async (data) => apiClient.post('/rooms', data),
  update: async (id, data) => apiClient.put(`/rooms/${id}`, data),
  delete: async (id) => apiClient.delete(`/rooms/${id}`),
  setBedStatus: async (bedId, status) => apiClient.put(`/beds/${bedId}`, { status }),
};

export const tenantService = {
  getAll: async () => apiClient.get('/tenants'),
  getById: async (id) => apiClient.get(`/tenants/${id}`),
  create: async (data) => apiClient.post('/tenants', data),
  update: async (id, data) => apiClient.put(`/tenants/${id}`, data),
  moveBed: async (tenantId, roomId, bedId) => apiClient.put(`/tenants/${tenantId}/move`, { roomId, bedId }),
  vacate: async (id) => apiClient.post(`/tenants/${id}/vacate`),
  delete: async (id) => apiClient.delete(`/tenants/${id}`),
};

export const rentService = {
  getAll: async () => apiClient.get('/rents'),
  getByTenant: async (tenantId) => apiClient.get(`/rents/tenant/${tenantId}`),
  create: async (data) => apiClient.post('/rents', data),
  sendReminder: async (tenantId, rentId) => apiClient.post(`/rents/${rentId}/remind`, { tenantId }),
};

export const paymentService = {
  getAll: async () => apiClient.get('/payments'),
  submit: async (data) => apiClient.post('/payments', data),
  approve: async (id) => apiClient.post(`/payments/${id}/approve`),
  reject: async (id, reason) => apiClient.post(`/payments/${id}/reject`, { reason }),
};

export const problemService = {
  getAll: async () => apiClient.get('/problems'),
  report: async (data) => apiClient.post('/problems', data),
  updateStatus: async (id, status, response) => apiClient.put(`/problems/${id}`, { status, response }),
};

export const notificationService = {
  getAll: async (userId) => apiClient.get(`/notifications?userId=${userId}`),
  markRead: async (id) => apiClient.put(`/notifications/${id}/read`),
  markAllRead: async (userId) => apiClient.put(`/notifications/read-all`, { userId }),
};
