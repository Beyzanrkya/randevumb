import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Vercel backend adresinizi buraya yazıyoruz
const API_URL = 'http://172.20.10.12:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İsteğe otomatik token ekleme
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
