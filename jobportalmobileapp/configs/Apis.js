import axios from "axios";

const BASE_URL = 'http://192.168.118.218:8000/';

export const endpoints = {
    'profiles': '/profiles/',
    'resumes': (userId) => `/users/${userId}/resumes/`,
    'companies': '/companies/',
    'jobs': '/jobs/',
    'applications': (jobId) => `/jobs/${jobId}/applications/`,
    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'application-details': (applicationId) => `/applications/${applicationId}`
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});