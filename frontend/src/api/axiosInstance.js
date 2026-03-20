import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api/v1',
});

// Request Interceptor: Automatically attach token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Automatically log out if token expires
axiosInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token expired or invalid
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_details');
        window.location.href = '/'; // Force back to login
    }
    return Promise.reject(error);
});

export default axiosInstance;
