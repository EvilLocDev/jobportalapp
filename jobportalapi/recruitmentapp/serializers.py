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

class ProfileSerializer(ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone_number', 'address', 'user_type']

class UserDetailSerializer(UserSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = UserSerializer.Meta.model
        fields = UserSerializer.Meta.fields + ['profile']

    # def create(self, validated_data):
    #     profile_data = validated_data.pop('profile')
    #     user_data = validated_data
    #
    #     # Tạo User trước
    #     u = User(**user_data)
    #     u.set_password(u.password)
    #     u.save()
    #
    #     # Tạo Profile sau
    #     Profile.objects.create(user=u, **profile_data)
    #
    #     return u

class ResumeSerializer(ModelSerializer):
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
        fields = ['id', 'user_id', 'name', 'logo', 'created_date']

class JobSerializer(ModelSerializer):
    class Meta:
        model = Job
        fields = ['id', 'company_id', 'title', 'salary', 'job_type', 'created_date']

class JobDetailSerializer(JobSerializer):
    company = CompanySerializer()
    is_saved = SerializerMethodField()

    def get_is_saved(self, job):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return job.savejob_set.filter(user=request.user, active=True).exists()
        return None

    class Meta:
        model = JobSerializer.Meta.model
        fields = JobSerializer.Meta.fields + ['description', 'location', 'company', 'is_saved']


class ApplicationSerializer(ModelSerializer):
    class Meta:
        model = Application
        fields = ['id', 'resume', 'status', 'created_date', 'candidate', 'job']
        read_only_fields = ['candidate', 'job', 'status']

    def validate_resume(self, resume):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return resume

        if resume.candidate != request.user:
            raise serializers.ValidationError("Bạn không thể sử dụng CV này.")
        return resume

class SaveJobSerializer(ModelSerializer):
    job = JobSerializer()

    class Meta:
        model = SaveJob
        fields = ['id', 'job', 'created_date']