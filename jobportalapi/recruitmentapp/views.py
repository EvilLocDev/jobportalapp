import os
from django.conf import settings
from django.db import models

from django.db.models import Q, OuterRef, Exists
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response

from . import perms
from . import serializers, paginators
from rest_framework import viewsets, generics, parsers, permissions, status
from .models import User, Profile, Resume, Company, Job, SaveJob, Application
from django.utils import timezone

from .utils import extract_text_from_pdf_url
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import GPT4AllEmbeddings
# from langchain_community.embeddings import SentenceTransformerEmbeddings

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

    # /users/current-user/recommendations/
    @action(
        methods=['get'],
        detail=False,
        url_path='recommendations',
        permission_classes=[permissions.IsAuthenticated, perms.IsCandidate]
    )
    def get_job_recommendations(self, request):
        user = request.user

        # 1. Tìm CV mặc định của ứng viên
        try:
            default_resume = Resume.objects.get(candidate=user, is_default=True, active=True)
        except Resume.DoesNotExist:
            return Response(
                {"detail": "Bạn cần có một CV mặc định (is_default=True) để nhận gợi ý."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not default_resume.file:
            return Response(
                {"detail": "CV mặc định của bạn chưa được tải lên."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2. Tải và trích xuất nội dung từ CV
        cv_url = default_resume.file.url
        cv_text = extract_text_from_pdf_url(cv_url)

        if not cv_text:
            return Response(
                {"detail": "Không thể đọc nội dung từ file CV của bạn. Vui lòng kiểm tra lại file."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 3. Tải Vector DB và mô hình embedding
        vector_db_path = os.path.join(settings.BASE_DIR, "vectorstores/job_db_faiss")

        model_path = os.path.join(settings.BASE_DIR, "models/all-MiniLM-L6-v2-f16.gguf")
        embedding_model = GPT4AllEmbeddings(model_file=model_path)

        db = FAISS.load_local(vector_db_path, embedding_model, allow_dangerous_deserialization=True)

        # 4. Thực hiện tìm kiếm tương đồng
        retriever = db.as_retriever(search_kwargs={"k": 5})
        similar_docs = retriever.invoke(cv_text)

        # 5. Lấy Job ID từ metadata và loại bỏ các ID trùng lặp
        job_ids = list(set([doc.metadata['job_id'] for doc in similar_docs]))

        if not job_ids:
            return Response([], status=status.HTTP_200_OK)

        # 6. Truy vấn DB chính để lấy thông tin đầy đủ của các Job
        preserved_order = models.Case(*[models.When(pk=pk, then=pos) for pos, pk in enumerate(job_ids)])
        recommended_jobs = Job.objects.filter(pk__in=job_ids).order_by(preserved_order)

        # 7. Serialize và trả về kết quả
        serializer = serializers.JobDetailSerializer(recommended_jobs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

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

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.filter(active = True)
    serializer_class = serializers.ResumeSerializer
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'retrieve']:
            self.permission_classes = [perms.IsResumeOwner]
        elif self.action in ['create', 'list']:
            self.permission_classes = [permissions.IsAuthenticated, perms.IsCandidate]
        return super().get_permissions()

    # Tra ve resume cua user dang nhap
    def get_queryset(self):
        return self.queryset.filter(candidate=self.request.user)

    # Khi tao thi gang candidate la user
    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.filter(active=True)
    serializer_class = serializers.CompanySerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser, parsers.FormParser]

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return serializers.CompanyDetailSerializer
        # Xem gon
        return self.serializer_class

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            return [permissions.IsAdminUser()]
        if self.action == 'create':
            return [perms.IsEmployer()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [perms.IsCompanyOwner()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        my_companies_param = self.request.query_params.get('my_companies')

        if my_companies_param and my_companies_param.lower() == 'true':
            if perms.IsEmployer().has_permission(self.request, self):
                query = self.queryset.filter(user=user)

                status_param = self.request.query_params.get('status')
                if status_param:
                    query = query.filter(status=status_param)

                return query.order_by('-created_date')
            else:
                return self.queryset.none()

        query = self.queryset.filter(status='approved')

        if perms.IsAdmin().has_permission(self.request, self):
            return self.queryset.order_by('-created_date')

        return query

    def perform_create(self, serializer):
        # Gan nguoi dang nhap la chu company
        serializer.save(user=self.request.user)

    # /companies/{id}/approve/
    @action(methods=['post'], detail=True, url_path='approve')
    def approve(self, request, pk):
        company = self.get_object()
        company.status = 'approved'
        company.save()
        return Response(serializers.CompanyDetailSerializer(company).data, status=status.HTTP_200_OK)

    # /companies/{id}/reject/
    @action(methods=['post'], detail=True, url_path='reject')
    def reject(self, request, pk):
        company = self.get_object()
        company.status = 'rejected'
        company.save()
        return Response(serializers.CompanyDetailSerializer(company).data, status=status.HTTP_200_OK)

    # /companies/<id>/jobs/
    @action(methods=['get'], detail=True, url_path='jobs')
    def get_jobs(self, request, pk):
        company = self.get_object()
        if company.status != 'approved':
            return Response({"detail": "Công ty này chưa được duyệt."}, status=status.HTTP_403_FORBIDDEN)

        jobs = company.job_set.filter(active=True)
        return Response(serializers.JobSerializer(jobs, many=True).data)

class JobViewSet(viewsets.ModelViewSet): # Du CRUD
    # jobs/<id>/
    queryset = Job.objects.select_related('company').filter(active=True) # Lay nhieu job thuoc mot cong ty
    serializer_class = serializers.JobDetailSerializer
    pagination_class = paginators.ItemPaginator

    def get_permissions(self):
        if self.action == 'retrieve':
            return [perms.IsJobOwnerOrActive()]

        if self.action in ['update', 'partial_update', 'destroy']:
            return [perms.IsJobOwner()]

        if self.action == 'create':
            return [perms.IsEmployer()]

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
        user = self.request.user

        my_jobs_param = self.request.query_params.get('my_jobs')

        # Job cua employer
        if user.is_authenticated and my_jobs_param and my_jobs_param.lower() == 'true':
            return query.filter(company__user=user).order_by('-created_date')

        # Loc cac job chua het han
        if self.action == 'list':
            query = query.filter(
                Q(expiration_date__gte=timezone.now().date()) | Q(expiration_date__isnull=True)
            )

        user = self.request.user
        if user.is_authenticated:
            saved_jobs_subquery = SaveJob.objects.filter(
                user=user,
                job=OuterRef('pk'),
                active=True
            )
            query = query.annotate(is_saved=Exists(saved_jobs_subquery))

        # /jobs/?q=<keyword>
        q = self.request.query_params.get('q')
        if q:
            query = query.filter(title__icontains=q)

        # /jobs/?company_id=<id>
        com_id = self.request.query_params.get('company_id')
        if com_id:
            query = query.filter(company_id=com_id)

        return query

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return serializers.JobCreateUpdateSerializer
        return serializers.JobDetailSerializer

    def perform_create(self, serializer):
        company = serializer.validated_data.get('company')

        if company.user != self.request.user:
            raise ValidationError("Bạn không có quyền đăng tin cho công ty này.")

        if company.status != 'approved':
            raise ValidationError("Công ty của bạn chưa được duyệt. Không thể đăng tin tuyển dụng.")

        serializer.save()

    # /jobs/{id}/save-job/
    @action(methods=['post'], detail=True, url_path='save-job', permission_classes=[perms.IsCandidate])
    def save_job(self, request, pk):
        sa, created = SaveJob.objects.get_or_create(user=request.user, job_id=pk)
        if not created:
            sa.active = not sa.active
        sa.save()

        return Response(serializers.JobDetailSerializer(self.get_queryset().get(pk=pk), context={'request': request}).data)

    # /jobs/<id>/applications/
    @action(methods=['get', 'post'], detail=True, url_path='applications')
    def applications_action(self, request, pk):
        job = self.get_object()

        if request.method == 'POST':
            if Application.objects.filter(job=job, candidate=request.user).exists():
                return Response({'detail': 'You applied this job.'}, status=status.HTTP_400_BAD_REQUEST)

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
    queryset = Application.objects.select_related('candidate', 'job__company').filter(active=True)
    serializer_class = serializers.ApplicationSerializer

    def get_permissions(self):
        if self.action == 'retrieve':
            return [permissions.IsAuthenticated(), (perms.IsApplicationOwner | perms.IsApplicationJobOwner)()]
        if self.action == 'update_status':
            return [perms.IsApplicationJobOwner()]
        if self.action == 'withdraw':
            return [perms.IsApplicationOwner()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if not user.is_authenticated:
            return Application.objects.none()

        profile = getattr(user, 'profile', None)
        if not profile:
            return Application.objects.none()

        if profile.user_type == 'candidate':
            return queryset.filter(candidate=user)
        elif profile.user_type == 'employer':
            return queryset.filter(job__company__user=user)
        elif user.is_staff:
            return queryset

        return Application.objects.none()

    # /applications/{id}/update-status/
    @action(
        methods=['patch'],
        detail=True,
        url_path='update-status',
        serializer_class=serializers.ApplicationUpdateSerializer
    )
    def update_status(self, request, pk=None):
        application = self.get_object()

        if application.status in ['accepted', 'rejected', 'withdrawn']:
            return Response(
                {'detail': f'Cannot change the status because the application had been accepted or rejected or candidate withdrawn ({application.status}).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializers.ApplicationSerializer(application).data,
            status=status.HTTP_200_OK
        )

    # /applications/{id}/review/
    @action(methods=['post'], detail=True, url_path='review')
    def review(self, request, pk=None):

        application = self.get_object()
        if application.status == 'pending':
            application.status = 'reviewed'
            application.save(update_fields=['status'])

        return Response(
            serializers.ApplicationSerializer(application).data,
            status=status.HTTP_200_OK
        )

    # /applications/{id}/withdraw/
    @action(methods=['post'], detail=True, url_path='withdraw')
    def withdraw(self, request, pk=None):
        application = self.get_object()
        if application.status not in ['pending', 'reviewed']:
            return Response(
                {'detail': "You just cannot change the application's status if it's status is pending or reviewed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = 'withdrawn'
        application.save()
        return Response(
            serializers.ApplicationSerializer(application).data,
            status=status.HTTP_200_OK
        )

    # def get_queryset(self):
    #     query = self.queryset
    #
    #     # /applications/?q=<keyword>
    #     q = self.request.query_params.get('q')
    #     if q:
    #         query = query.filter(status__icontains=q)
    #
    #     # /applications/?job_id=<id>
    #     job_id = self.request.query_params.get('job_id')
    #     if job_id:
    #         query = query.filter(job_id=job_id)
    #
    #     return query