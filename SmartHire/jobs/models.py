from django.db import models
from accounts.models import User, RecruiterProfile


class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('remote', 'Remote'),
        ('internship', 'Internship'),
        ('contract', 'Contract'),
    ]
    EXPERIENCE_CHOICES = [
        ('fresher', 'Fresher (0 yrs)'),
        ('junior', 'Junior (1-3 yrs)'),
        ('mid', 'Mid Level (3-5 yrs)'),
        ('senior', 'Senior (5+ yrs)'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('draft', 'Draft'),
    ]

    recruiter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_jobs')
    company = models.ForeignKey(RecruiterProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    responsibilities = models.TextField(blank=True)
    skills_required = models.TextField(help_text="Comma-separated: Python, Django, SQL")
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='fresher')
    location = models.CharField(max_length=200)
    is_remote = models.BooleanField(default=False)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    openings = models.PositiveIntegerField(default=1)
    application_deadline = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def get_skills_list(self):
        if self.skills_required:
            return [s.strip().lower() for s in self.skills_required.split(',') if s.strip()]
        return []

    def get_salary_display(self):
        if self.salary_min and self.salary_max:
            return f"₹{self.salary_min:,} - ₹{self.salary_max:,}"
        elif self.salary_min:
            return f"₹{self.salary_min:,}+"
        return "Negotiable"

    def get_company_name(self):
        if self.company:
            return self.company.company_name
        return self.recruiter.get_full_name() or self.recruiter.username

    def calculate_match(self, candidate_skills):
        job_skills = set(self.get_skills_list())
        if not job_skills:
            return 0, []
        cand = set(s.lower().strip() for s in candidate_skills)
        matched = job_skills & cand
        missing = list(job_skills - cand)
        score = int(len(matched) / len(job_skills) * 100)
        return score, missing

    def __str__(self):
        return f"{self.title} @ {self.get_company_name()}"


class SavedJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')
