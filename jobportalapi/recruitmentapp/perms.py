from rest_framework import permissions

class IsAdmin(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsCandidate(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        profile = getattr(request.user, 'profile', None)
        return bool(profile and profile.user_type == 'candidate')

class IsEmployer(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        profile = getattr(request.user, 'profile', None)
        return bool(profile and profile.user_type == 'employer')

class IsResumeOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, resume):
        return request.user == resume.candidate

class IsJobOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, job):
        return request.user == job.company.user