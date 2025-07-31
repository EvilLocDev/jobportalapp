from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('profiles', views.ProfileViewSet, basename='profile')
router.register('resumes', views.ResumeViewSet, basename='resume')
router.register('companies', views.CompanyViewSet, basename='company')
router.register('jobs', views.JobViewSet, basename='job')

urlpatterns = [
    path('', include(router.urls)),
]