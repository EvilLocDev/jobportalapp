import axios from "axios";

const BASE_URL = 'http://192.168.100.222:8000/';

export const endpoints = {
    'profiles': '/profiles/',
    'resumes': '/resumes/',
    'resume-details': (resumeId) => `/resumes/${resumeId}/`,
    // 'resumes': (userId) => `/users/${userId}/resumes/`, // If resumes are user-specific

    'companies': '/companies/',
    'jobs': '/jobs/',
    'job-details': (jobId) => `/jobs/${jobId}/`,
    'save-job': (jobId) => `/jobs/${jobId}/save-job/`,
    'saved-jobs': '/users/saved-jobs/',
    'apply-job': (jobId) => `/jobs/${jobId}/applications/`,

    'my-companies': '/companies/?my_companies=true',
    'my-approved-companies': '/companies/?my_companies=true&status=approved',
    'company-jobs': (companyId) => `/companies/${companyId}/jobs/`,
    

    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'change-password': '/users/change-password/',

    'application-details': (applicationId) => `/applications/${applicationId}`,

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