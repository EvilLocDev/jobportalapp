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
    'company-details': (companyId) => `/companies/${companyId}/`,
    'save-job': (jobId) => `/jobs/${jobId}/save-job/`,
    'saved-jobs': '/users/saved-jobs/',

    'my-companies': '/companies/?my_companies=true',
    'my-jobs': (companyId) => `/jobs/?my_jobs=true&company_id=${companyId}`,
    'my-approved-companies': '/companies/?my_companies=true&status=approved',
    'company-jobs': (companyId) => `/companies/${companyId}/jobs/`,

    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'change-password': '/users/change-password/',

    'recommendations': '/users/recommendations/',
    'apply-job': (jobId) => `/jobs/${jobId}/applications/`,
    'job-applications': (jobId) => `/jobs/${jobId}/applications/`,
    'application-details': (applicationId) => `/applications/${applicationId}/`,
    'update-application-status': (applicationId) => `/applications/${applicationId}/update-status/`,
    'review-application': (applicationId) => `/applications/${applicationId}/review/`,
    'withdraw-application': (applicationId) => `/applications/${applicationId}/withdraw/`,
    'my-applications': '/applications/',

    'calculate-job-fit': (jobId) => `/jobs/${jobId}/calculate-fit/`,
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