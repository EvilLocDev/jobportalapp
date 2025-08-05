from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField

class User(AbstractUser):
    avatar = CloudinaryField(null = True)

class BaseModel(models.Model):
    active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    updated_date = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Profile(BaseModel):
    USER_TYPE_CHOICES = (
        ('candidate', 'Ứng viên'),
        ('employer', 'Nhà tuyển dụng'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)

    def __str__(self):
        return self.user.username

# Candidate
class Resume(BaseModel):
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=255)
    file = CloudinaryField(null = True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# Company
class Company(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    description = models.TextField()
    logo = CloudinaryField()
    website = models.URLField()
    address = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Job(BaseModel):
    JOB_TYPE_CHOICES = (
        ('full_time', 'Toàn thời gian'),
        ('part_time', 'Bán thời gian'),
        ('remote', 'Từ xa'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    description = RichTextField(null=True)
    location = models.CharField(max_length=255)
    salary = models.IntegerField()
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES)

    class Meta:
        unique_together = ( 'title', 'company')

    def __str__(self):
        return self.title

class Application(BaseModel):
    STATUS_CHOICES = (
        ('pending', 'Đang chờ'),
        ('reviewed', 'Đã xem'),
        ('rejected', 'Từ chối'),
        ('accepted', 'Chấp nhận'),
    )

    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.PROTECT)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    class Meta:
        ordering = ['-id',]

class SaveJob(BaseModel):
    Job = models.ForeignKey(Job, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'Job') # Use active field to save the job & each user just save only one time