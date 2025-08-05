import axios from "axios";

const BASE_URL = 'http://192.168.100.222:8000/';

export const endpoints = {
    'profiles': '/profiles/',
    'resumes': (userId) => `/users/${userId}/resumes/`,
    'companies': '/companies/',
    'jobs': '/jobs/',
    'applications': (jobId) => `/jobs/${jobId}/applications/`
};

export default axios.create({
    baseURL: BASE_URL
});