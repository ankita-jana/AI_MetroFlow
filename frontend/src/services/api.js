import axios from 'axios';

let API_BASE_URL = 'http://127.0.0.1:8000/api';

if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host.includes('devtunnels.ms')) {
    // Rewrite frontend tunnel to backend tunnel (5173 -> 8000)
    API_BASE_URL = `https://${host.replace('-5173', '-8000')}/api`;
  } else if (host !== 'localhost' && host !== '127.0.0.1') {
    // For local network access (e.g. 192.168.x.x)
    API_BASE_URL = `http://${host}:8000/api`;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach the JWT token
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

export default api;
