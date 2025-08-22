from rest_framework.decorators import action
from rest_framework.response import Response

from . import perms
from . import serializers, paginators
from rest_framework import viewsets, generics, parsers, permissions, status
from .models import User, Profile, Resume, Company, Job, SaveJob, Application

class UserViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = User.objects.select_related('profile').filter(profile__active=True)
    pagination_class = paginators.ItemPaginator
    parser_classes = [parsers.MultiPartParser]

    def get_serializer_class(self):
        if self.action == 'create':
            # /users/ (post)
            return serializers.UserSerializer
        return serializers.UserDetailSerializer

    def get_queryset(self):
        query = self.queryset

        # /users/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(username__icontains=q)

        return query

    # /users/change-password/
    @action(
        methods=['post'],
        detail=False,
        url_path='change-password',
        permission_classes=[permissions.IsAuthenticated],
        parser_classes=[parsers.JSONParser]
    )
    def change_password(self, request):
        user = request.user
        serializer = serializers.ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Kiểm tra mật khẩu cũ
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({"old_password": ["Mật khẩu cũ không đúng."]}, status=status.HTTP_400_BAD_REQUEST)

            # Đặt mật khẩu mới
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"status": "Mật khẩu đã được thay đổi thành công."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # /users/<id>/resumes/
    @action(methods=['get'], detail=True, url_path='resumes')
    def get_resumes(self, request, pk):
        resumes = self.get_object().resume_set.filter(active=True)
        return Response(serializers.ResumeSerializer(resumes, many=True).data)

    # /users/current-user/
    @action(methods=['get', 'patch'], url_path='current-user', detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_current_user(self, request):
        u = request.user
        if request.method == 'PATCH':
            # Su dung UserDetailSerializer de cap nhat cac truong cua user va profile nhung tru password
            serializer = serializers.UserDetailSerializer(u, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(serializers.UserDetailSerializer(u).data)

    # /users/saved-jobs/
    @action(methods=['get'], detail=False, url_path='saved-jobs', permission_classes=[permissions.IsAuthenticated])
    def get_save_jobs(self, request):
        u = request.user
        jobs = u.savejob_set.filter(active=True)
        return Response(serializers.SaveJobSerializer(jobs, many=True).data)

class ProfileViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Profile.objects.filter(active = True)
    serializer_class = serializers.ProfileSerializer

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

class ResumeViewSet(viewsets.ViewSet, generics.DestroyAPIView, generics.UpdateAPIView):
    queryset = Resume.objects.filter(active = True)
    serializer_class = serializers.ResumeSerializer
    permission_classes = [perms.IsResumeOwner]

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
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action == 'applications_action':
            if self.request.method == 'POST':
                return [perms.IsCandidate()]
            elif self.request.method == 'GET':
                return [perms.IsJobOwner()]

        elif self.action == 'save_job':
            return [perms.IsCandidate()]

        return [permissions.AllowAny()]

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

    # /jobs/{id}/save-job/
    @action(methods=['post'], detail=True, url_path='save-job', permission_classes=[perms.IsCandidate])
    def save_job(self, request, pk):
        sa, created = SaveJob.objects.get_or_create(user=request.user, job_id=pk)
        if not created:
            sa.active = not sa.active
        sa.save()

        return Response(serializers.JobDetailSerializer(self.get_object(), context={'request': request}).data)

    # /jobs/<id>/applications/
    @action(methods=['get', 'post'], detail=True, url_path='applications')
    def applications_action(self, request, pk):
        job = self.get_object()

        if request.method == 'POST':
            # Kiểm tra trước để tránh truy vấn DB không cần thiết
            if Application.objects.filter(job=job, candidate=request.user).exists():
                return Response({'detail': 'Bạn đã ứng tuyển công việc này rồi.'}, status=status.HTTP_400_BAD_REQUEST)

            # Truyền context vào serializer
            serializer = serializers.ApplicationSerializer(data=request.data, context={'request': request, 'job': job})
            if serializer.is_valid(raise_exception=True):
                serializer.save(candidate=request.user, job=job)  # Truyền các giá trị read-only vào hàm save
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:  # GET request
            applications = job.application_set.filter(active=True)
            return Response(serializers.ApplicationSerializer(applications, many=True).data)

class ApplicationViewSet(viewsets.ViewSet, generics.RetrieveAPIView, generics.ListAPIView):
    # /applications/<id>
    queryset = Application.objects.select_related('candidate').filter(active=True)
    serializer_class = serializers.ApplicationSerializer

    def get_queryset(self):
        query = self.queryset

        # /applications/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(status__icontains=q)

        # /applications/?job_id=<id>
        job_id = self.request.query_params.get('job_id')
        if job_id:
            query = query.filter(job_id=job_id)

        return query

    # trong ApplicationViewSet
    # def get_queryset(self):
    #     user = self.request.user
    #     queryset = super().get_queryset()
    #
    #     if not user.is_authenticated:
    #         return Application.objects.none()  # Không trả về gì nếu chưa đăng nhập
    #
    #     profile = getattr(user, 'profile', None)
    #     if profile and profile.user_type == 'candidate':
    #         # Ứng viên chỉ thấy application của mình
    #         return queryset.filter(candidate=user)
    #     elif profile and profile.user_type == 'employer':
    #         # Nhà tuyển dụng chỉ thấy application cho các job của công ty mình
    #         return queryset.filter(job__company__user=user)
    #     elif user.is_staff:
    #         return queryset  # Admin thấy tất cả
    #
    #     return Application.objects.none()  # Mặc định không trả về gì