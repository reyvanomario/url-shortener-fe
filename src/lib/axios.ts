// lib/axios.ts
import axios from 'axios';
import humps from 'humps';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
    if (config.data && config.headers['Content-Type'] === 'application/json') {
        config.data = humps.decamelizeKeys(config.data);
    }

    // Untuk form-data, jangan diubah
    if (config.data instanceof FormData || config.data instanceof URLSearchParams) {
        return config;
    }

    return config;
});


api.interceptors.response.use((response) => {
    if (response.data && typeof response.data === 'object') {
        response.data = humps.camelizeKeys(response.data);
    }
    return response;
}, (error) => {
    if (error.response?.data) {
        error.response.data = humps.camelizeKeys(error.response.data);
    }
    return Promise.reject(error);
});

export default api;