// src/api/authService.ts
import axiosInstance from './axios.ts';

// Kullanıcı kaydı için servis
export const registerUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    userName: string;
    password: string;
    confirmPassword: string;
}) => {
    try {
        const response = await axiosInstance.post('/Register', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Registration failed');
    }
};

// Kullanıcı girişi için servis
export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    try {
        const response = await axiosInstance.post('/Login', data);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};


// E-posta doğrulama servisi
export const confirmEmail = async (email: string, token: string) => {
    try {
        const response = await axiosInstance.post(`/ConfirmEmail?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Email confirmation failed');
    }
};
export default { registerUser, loginUser, confirmEmail };