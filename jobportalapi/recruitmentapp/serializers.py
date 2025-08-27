from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import User, Profile, Resume, Company, Job, Application, SaveJob

class UserSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = User
        fields = [ 'id', 'username', 'password', 'first_name', 'last_name', 'avatar', 'email']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        data = validated_data.copy()
        u = User(**data)
        u.set_password(u.password)
        u.save()

        return u

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError("Mật khẩu mới không khớp.")
        return data

class ProfileSerializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_number', 'address', 'user_type']

class UserDetailSerializer(UserSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['profile']

    def create(self, validated_data):
        # Tách dữ liệu của profile ra khỏi validated_data
        profile_data = validated_data.pop('profile')

        # Dùng lại logic create của UserSerializer cha
        user = super().create(validated_data)

        Profile.objects.create(user=user, **profile_data)

        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)

        # Dung lai logic cua cha
        user_instance = super().update(instance, validated_data)

        if profile_data:
            profile_instance = user_instance.profile
            new_user_type = profile_data.get('user_type')

            if profile_instance.user_type == 'employer' and new_user_type == 'candidate':
                if instance.company_set.exists():
                    raise serializers.ValidationError({
                        "user_type": "Bạn không thể đổi vai trò thành Candidate vì bạn đã tạo công ty. Vui lòng liên hệ hỗ trợ."
                    })

            elif profile_instance.user_type == 'candidate' and new_user_type == 'employer':
                if instance.resume_set.exists():
                    raise serializers.ValidationError({
                        "user_type": "Bạn không thể đổi vai trò thành Employer vì bạn đã tạo resume. Vui lòng liên hệ hỗ trợ."
                    })

            for attr, value in profile_data.items():
                setattr(profile_instance, attr, value)
            profile_instance.save()

        return user_instance

class ResumeSerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['file'] = instance.file.url if instance.file else ''
        return data

    class Meta:
        model = Resume
        fields = ['id','candidate_id', 'title', 'file', 'created_date', 'is_default']

class CompanySerializer(ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['logo'] = instance.logo.url if instance.logo else ''
        return data

    class Meta:
        model = Company
        fields = ['id', 'user_id', 'name', 'logo', 'status', 'created_date']

class CompanyDetailSerializer(CompanySerializer):
    class Meta:
        model = CompanySerializer.Meta.model
        fields = ['id', 'user', 'name', 'description', 'logo', 'website', 'address', 'status', 'created_date']
        read_only_fields = ['status', 'user']

class JobSerializer(ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'company_id', 'title', 'salary', 'job_type', 'created_date', 'expiration_date']

class JobCreateUpdateSerializer(ModelSerializer):
    # client chi can gui company_id
    company = serializers.PrimaryKeyRelatedField(queryset=Company.objects.all())

    class Meta:
        model = Job
        fields = ['company', 'title', 'description', 'location', 'salary', 'job_type', 'expiration_date']

class JobDetailSerializer(JobSerializer):
    company = CompanySerializer()
    is_saved = serializers.BooleanField(read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = JobSerializer.Meta.model
        fields = JobSerializer.Meta.fields + ['description', 'location', 'company', 'is_saved', 'expiration_date', 'status']

    def get_status(self, job):
        if job.expiration_date and job.expiration_date < timezone.now().date():
            return 'expired'
        return 'active'

class ApplicationSerializer(ModelSerializer):
    job = JobDetailSerializer(read_only=True)
    candidate = UserSerializer(read_only=True)
    resume = ResumeSerializer(read_only=True) # Doc

    resume_id = serializers.PrimaryKeyRelatedField( # Ghi
        queryset=Resume.objects.all(), source='resume', write_only=True
    )

    class Meta:
        model = Application
        fields = ['id', 'resume', 'resume_id', 'status', 'created_date', 'candidate', 'job']
        read_only_fields = ['candidate', 'job', 'status']

    def validate_resume_id(self, resume):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return resume

        if resume.candidate != request.user:
            raise serializers.ValidationError("You have not permission to use this resume.")
        return resume

class ApplicationUpdateSerializer(ModelSerializer):
    class Meta:
        model = Application
        fields = ['status']
        extra_kwargs = {
            'status': {'read_only': False}
        }

    def validate_status(self, value):
        if value == 'withdrawn':
            raise serializers.ValidationError("You have not permission to withdrawn this application.")
        return value


class SaveJobSerializer(ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = SaveJob
        fields = ['id', 'job', 'created_date']