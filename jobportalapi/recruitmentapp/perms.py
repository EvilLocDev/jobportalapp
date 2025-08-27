from django.utils import timezone
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

class IsCompanyApprovedOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        # obj ở đây là Company
        return obj.user == request.user and obj.status == 'approved'

class IsCompanyOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        # obj ở đây là Company
        return obj.user == request.user

class IsJobOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, job):
        return request.user == job.company.user

class IsJobOwnerOrActive(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # obj ở đây là một instance của Job
        is_expired = obj.expiration_date and obj.expiration_date < timezone.now().date()
        is_owner = request.user == obj.company.user

        return not is_expired or is_owner

class IsApplicationOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, application):
        return application.candidate == request.user

class IsApplicationJobOwner(permissions.IsAuthenticated):
    def has_object_permission(self, request, view, application):
        return application.job.company.user == request.user