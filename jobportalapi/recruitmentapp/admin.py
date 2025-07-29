from django.contrib import admin
from django.db.models import Count
from django.template.response import TemplateResponse
from recruitmentapp.models import Profile, Resume, Company, Job, Application
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.urls import path

class JobDescription(forms.ModelForm):
    content = forms.CharField(widget=CKEditorUploadingWidget)
    class Meta:
        model = Job
        fields = '__all__'

class MyJobAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'active', 'location', 'created_date']
    search_fields = ['title']
    list_filter = ['id', 'created_date']
    list_editable = ['title']
    form = JobDescription

    class Media:
        css = {
            'all': ('/static/css/styles.css', )
        }

class MyAdminSite(admin.AdminSite):
    site_header = 'Job Portal'

    def get_urls(self):
        return [path('job-stats/', self.job_stats), ] + super().get_urls()

    def job_stats(self, request):
        stats = Company.objects.annotate(job_count=Count('job__id')).values('id', 'name', 'job_count')

        return TemplateResponse(request, 'admin/stats.html', {
            'stats': stats
        })

admin_site = MyAdminSite(name='eJob')

admin_site.register(Profile)
admin_site.register(Resume)
admin_site.register(Company)
admin_site.register(Job, MyJobAdmin)
admin_site.register(Application)
