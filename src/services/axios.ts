
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://evrenblackbird.com/',  // API base URL
    headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',  // JSON olarak veri gönderiyoruz
    },
});





// Authorization header'ı otomatik ekle
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
