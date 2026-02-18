import axios from 'axios';

// Use Vite env (import.meta.env). Do NOT reference `process` in browser code.
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor для добавления токена в формат Django TokenAuthentication
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Django REST Framework TokenAuthentication expects: 'Authorization: Token <key>'
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default apiClient;