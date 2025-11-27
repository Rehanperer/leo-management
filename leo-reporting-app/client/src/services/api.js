import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (data) => api.post('/auth/register', data)
};

export const projects = {
    getAll: () => api.get('/projects'),
    getOne: (id) => api.get(`/projects/${id}`),
    create: (formData) => api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/projects/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/projects/${id}`)
};

export const financial = {
    getAll: () => api.get('/financial'),
    getOne: (id) => api.get(`/financial/${id}`),
    create: (data) => api.post('/financial', data),
    update: (id, data) => api.put(`/financial/${id}`, data),
    delete: (id) => api.delete(`/financial/${id}`)
};

export default api;
