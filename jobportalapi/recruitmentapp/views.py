from rest_framework.decorators import action
from rest_framework.response import Response

from . import serializers, paginators
from rest_framework import viewsets, generics
from .models import User, Profile, Resume, Company, Job, Application

class UserViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = User.objects.filter(is_active = True)
    serializer_class = serializers.UserSerializer
    pagination_class = paginators.ItemPaginator

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(username__icontains=q)

        return query

    @action(methods=['get'], detail=True, url_path='resumes')
    def get_resumes(self, request, pk):
        resumes = self.get_object().resume_set.filter(active=True)
        return Response(serializers.ResumeSerializer(resumes, many=True).data)

class ProfileViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Profile.objects.filter(active = True)
    serializer_class = serializers.ProfileSerializer

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(address__icontains=q)

        user_id = self.request.query_params.get('user_id')
        if user_id:
            query = query.filter(user_id=user_id)

        return query

class ResumeViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Resume.objects.prefetch_related('candidate').filter(active=True)
    serializer_class = serializers.ResumeDetailSerializer

class CompanyViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Company.objects.filter(active=True)
    serializer_class = serializers.CompanySerializer

    @action(methods=['get'], detail=True, url_path='jobs')
    def get_jobs(self, request, pk):
        jobs = self.get_object().job_set.filter(active=True)
        return Response(serializers.JobSerializer(jobs, many=True).data)

class JobViewSet(viewsets.ViewSet, generics.RetrieveAPIView):
    queryset = Job.objects.prefetch_related('company').filter(active=True)
    serializer_class = serializers.JobDetailSerializer

    def get_queryset(self):
        query = self.queryset

        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)

        com_id = self.request.query_params.get('company_id')
        if com_id:
            query = query.filter(company_id=com_id)

        return query