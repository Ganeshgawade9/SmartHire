from django.contrib import admin
from .models import Job, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'recruiter', 'job_type', 'status', 'created_at')
    list_filter = ('status', 'job_type', 'experience_level')
    search_fields = ('title', 'skills_required')


admin.site.register(SavedJob)
