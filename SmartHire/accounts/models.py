from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
        ('jobseeker', 'Job Seeker'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='jobseeker')
    phone = models.CharField(max_length=15, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)

    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    def is_recruiter(self):
        return self.role == 'recruiter'

    def is_jobseeker(self):
        return self.role == 'jobseeker'

    def __str__(self):
        return f"{self.username} ({self.role})"


class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='jobseeker_profile')
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    skills = models.TextField(blank=True, help_text="Comma-separated skills e.g. Python, Django, SQL")
    experience_years = models.PositiveIntegerField(default=0)
    education = models.CharField(max_length=200, blank=True)
    expected_salary = models.PositiveIntegerField(null=True, blank=True)
    preferred_location = models.CharField(max_length=100, blank=True)
    job_type_preference = models.CharField(
        max_length=20,
        choices=[('full_time', 'Full Time'), ('part_time', 'Part Time'),
                 ('remote', 'Remote'), ('internship', 'Internship')],
        blank=True
    )
    is_available = models.BooleanField(default=True)

    def get_skills_list(self):
        if self.skills:
            return [s.strip().lower() for s in self.skills.split(',') if s.strip()]
        return []

    def __str__(self):
        return f"{self.user.username}'s Profile"


class RecruiterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='recruiter_profile')
    company_name = models.CharField(max_length=200, default='My Company')
    company_website = models.URLField(blank=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    company_description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    company_size = models.CharField(max_length=50, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.company_name} ({self.user.username})"
