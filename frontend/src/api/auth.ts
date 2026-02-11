import apiClient from './client';

export const authAPI = {
    login: (email: string, password: string) => 
        apiClient.post('/auth/login/', { email, password }),
    register: (userData: any) => 
        apiClient.post('/auth/register/', userData),
    logout: () => 
        apiClient.post('/auth/logout/'),
    getProfile: () => 
        apiClient.get('/auth/profile/'),
};