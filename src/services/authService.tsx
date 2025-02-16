import axios from "axios";
import { User } from "../models/User";
const API_URL = "https://randomapi.com/auth";

export  const authService = {

        login: async (user: User) => {
            return await axios.post(`${API_URL}/login`, user);
        },

            register: async (user: User) => {
            return await axios.post(`${API_URL}/register`, user);
        }

}