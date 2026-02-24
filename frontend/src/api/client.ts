import axios, { AxiosError } from 'axios';

// Use Vite env (import.meta.env). Do NOT reference `process` in browser code.
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const APP_STATE_KEY = 'appState';
const REFRESH_ENDPOINT = '/users/token/refresh/';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const clearAuthStorage = (shouldReload = true) => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem(APP_STATE_KEY);
    if (shouldReload && typeof window !== 'undefined') {
        window.location.reload();
    }
};

const requestAccessTokenRefresh = async (): Promise<string | null> => {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) return null;
    try {
        const response = await axios.post(
            `${API_URL}${REFRESH_ENDPOINT}`,
            { refresh },
            { headers: { 'Content-Type': 'application/json' } }
        );
        const newAccess: string | undefined = response.data?.access;
        if (newAccess) {
            localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
            return newAccess;
        }
    } catch (error) {
        console.error('Failed to refresh access token', error);
    }
    return null;
};

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { response, config } = error;
        if (!response || !config || response.status !== 401 || (config as any)._retry) {
            return Promise.reject(error);
        }

        (config as any)._retry = true;

        if (!refreshPromise) {
            refreshPromise = requestAccessTokenRefresh().finally(() => {
                refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;

        if (!newAccessToken) {
            clearAuthStorage();
            return Promise.reject(error);
        }

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
    }
);

export default apiClient;