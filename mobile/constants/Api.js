import axios from 'axios';

// Vercel backend adresinizi buraya yazıyoruz
// Yerel test için localhost adresini kullanıyoruz
const API_URL = 'http://192.168.0.103:5000/api'; // Bilgisayarınızın yerel IP adresi (Telefon bağlantısı için)
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
