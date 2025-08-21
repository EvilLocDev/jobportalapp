import axios from "axios";

const BASE_URL = 'http://192.168.2.210:8000/';

export const endpoints = {
    'profiles': '/profiles/',
    'resumes': (userId) => `/users/${userId}/resumes/`,
    'companies': '/companies/',
    'jobs': '/jobs/',
    'job-details': (jobId) => `/jobs/${jobId}/`,

    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'change-password': '/users/change-password/',

    'application-details': (applicationId) => `/applications/${applicationId}`,
    'save-job': (jobId) => `/jobs/${jobId}/save-job/`,
    'saved-jobs': '/users/saved-jobs/',
    'apply-job': (jobId) => `/jobs/${jobId}/applications/`,
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});