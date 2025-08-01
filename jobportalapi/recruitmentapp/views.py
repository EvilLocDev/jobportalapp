from rest_framework.decorators import action
from rest_framework.response import Response

from . import serializers, paginators
from rest_framework import viewsets, generics, parsers, permissions
from .models import User, Profile, Resume, Company, Job, Application

class UserViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = User.objects.filter(is_active = True)
    serializer_class = serializers.UserSerializer
    pagination_class = paginators.ItemPaginator

    # users/?q=<keyword>
    def get_queryset(self):
        query = self.queryset

        # /users/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(username__icontains=q)

        return query

    # /users/<id>/resumes/
    @action(methods=['get'], detail=True, url_path='resumes')
    def get_resumes(self, request, pk):
        resumes = self.get_object().resume_set.filter(active=True)
        return Response(serializers.ResumeSerializer(resumes, many=True).data)

    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            for k, v in request.data.items():
                if k in ['first_name', 'last_name']:
                    setattr(u, k, v)
                elif k.__eq__('password'):
                    u.set_password(v)

            u.save()

        return Response(serializers.UserSerializer(u).data)

class ProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Profile.objects.filter(active = True)
    serializer_class = serializers.ProfileSerializer
    parser_classes = [parsers.MultiPartParser]

    def get_queryset(self):
        query = self.queryset

        # /profiles/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(address__icontains=q)

        # /profiles/?user_id=<id>
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

    # /companies/<id>/jobs/
    @action(methods=['get'], detail=True, url_path='jobs')
    def get_jobs(self, request, pk):
        jobs = self.get_object().job_set.filter(active=True)
        return Response(serializers.JobSerializer(jobs, many=True).data)

class JobViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView):
    # jobs/<id>/
    queryset = Job.objects.select_related('company').filter(active=True) # Lay nhieu job thuoc mot cong ty
    serializer_class = serializers.JobDetailSerializer

    def get_queryset(self):
        query = self.queryset

        # /jobs/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)

        # /jobs/?company_id=<id>
        com_id = self.request.query_params.get('company_id')
        if com_id:
            query = query.filter(company_id=com_id)

        return query