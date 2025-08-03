import axios from "axios";

const BASE_URL = 'http://192.168.1.52:8000/';

export const endpoints = {
    'profiles': '/profiles/',
    'resumes': (userId) => `/users/${userId}/resumes/`,
    'companies': '/companies/',
    'jobs': '/jobs/'
};

export default axios.create({
    baseURL: BASE_URL
});