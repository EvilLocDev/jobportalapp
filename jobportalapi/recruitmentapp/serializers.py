from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import User, Profile, Resume, Company, Job, Application

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'email']
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
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['avatar'] = instance.avatar.url if instance.avatar else ''
        return data

    class Meta:
        model = Profile
        fields = ['avatar', 'phone_number', 'address', 'user_type']

class ResumeSerializer(ModelSerializer):
    class Meta:
        model = Resume
        fields = ['id', 'candidate_id', 'title', 'created_date', 'is_default']

class ResumeDetailSerializer(ResumeSerializer):
    candidate = UserSerializer()

    class Meta:
        model = ResumeSerializer.Meta.model
        fields = ResumeSerializer.Meta.fields + ['file_path', 'candidate']

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
    saved_job = SerializerMethodField()

    def get_saved_job(self, job):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return job.savejob_set.filter(user=request.user, active=True).exists()
        return None

    class Meta:
        model = JobSerializer.Meta.model
        fields = JobSerializer.Meta.fields + ['description', 'location', 'company', 'saved_job']