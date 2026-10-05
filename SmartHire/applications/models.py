from django.db import models
from accounts.models import User
from jobs.models import Job


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    STATUS_COLORS = {
        'applied': 'secondary', 'under_review': 'info', 'shortlisted': 'primary',
        'interview_scheduled': 'warning', 'selected': 'success',
        'rejected': 'danger', 'withdrawn': 'dark',
    }

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True)
    resume = models.FileField(upload_to='application_resumes/', blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='applied')
    match_score = models.PositiveIntegerField(default=0)
    recruiter_notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job', 'applicant')
        ordering = ['-applied_at']

    def get_status_color(self):
        return self.STATUS_COLORS.get(self.status, 'secondary')

    def __str__(self):
        return f"{self.applicant.username} → {self.job.title}"


class Interview(models.Model):
    TYPE_CHOICES = [
        ('phone', 'Phone Screen'), ('video', 'Video Call'),
        ('technical', 'Technical'), ('hr', 'HR Round'), ('onsite', 'On-site'),
    ]
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'), ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='video')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    meeting_link = models.URLField(blank=True)
    venue = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"Interview for {self.application}"
