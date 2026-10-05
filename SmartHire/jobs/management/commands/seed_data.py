from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import JobSeekerProfile, RecruiterProfile
from jobs.models import Job

User = get_user_model()

JOBS = [
    {'title': 'Senior Python Developer', 'skills': 'Python, Django, REST API, PostgreSQL, Docker',
     'job_type': 'full_time', 'experience_level': 'senior', 'location': 'Bangalore',
     'salary_min': 1200000, 'salary_max': 2000000,
     'description': 'We are looking for an experienced Python developer to join our backend team.',
     'requirements': '5+ years Python\nDjango/DRF expertise\nPostgreSQL experience'},
    {'title': 'Full Stack Developer', 'skills': 'React, Node.js, MongoDB, Python, AWS',
     'job_type': 'full_time', 'experience_level': 'mid', 'location': 'Hyderabad',
     'salary_min': 800000, 'salary_max': 1400000,
     'description': 'Join our product team as a Full Stack Developer.'},
    {'title': 'Data Scientist', 'skills': 'Python, Machine Learning, TensorFlow, SQL, pandas',
     'job_type': 'full_time', 'experience_level': 'mid', 'location': 'Remote',
     'salary_min': 1000000, 'salary_max': 1800000, 'is_remote': True,
     'description': 'Build and deploy ML models for our recommendation engine.'},
    {'title': 'Frontend Developer (React)', 'skills': 'React, JavaScript, TypeScript, CSS, HTML',
     'job_type': 'full_time', 'experience_level': 'junior', 'location': 'Mumbai',
     'salary_min': 500000, 'salary_max': 900000,
     'description': 'Build responsive user interfaces for our e-commerce platform.'},
    {'title': 'DevOps Engineer', 'skills': 'Docker, Kubernetes, AWS, CI/CD, Linux, Terraform',
     'job_type': 'full_time', 'experience_level': 'mid', 'location': 'Remote',
     'salary_min': 1100000, 'salary_max': 1900000, 'is_remote': True,
     'description': 'Manage and scale our cloud infrastructure.'},
    {'title': 'Django Backend Developer', 'skills': 'Python, Django, PostgreSQL, Redis, Celery',
     'job_type': 'remote', 'experience_level': 'junior', 'location': 'Remote',
     'salary_min': 400000, 'salary_max': 700000, 'is_remote': True,
     'description': 'Build RESTful APIs for our fintech application.'},
    {'title': 'Mobile App Developer', 'skills': 'React Native, JavaScript, Android, iOS, Firebase',
     'job_type': 'full_time', 'experience_level': 'mid', 'location': 'Delhi',
     'salary_min': 700000, 'salary_max': 1200000,
     'description': 'Develop cross-platform mobile applications.'},
    {'title': 'AI/ML Intern', 'skills': 'Python, Machine Learning, scikit-learn, pandas',
     'job_type': 'internship', 'experience_level': 'fresher', 'location': 'Bangalore',
     'salary_min': 15000, 'salary_max': 25000,
     'description': 'Learn and contribute to real-world ML projects.'},
]


class Command(BaseCommand):
    help = 'Seed SmartHire with demo data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Seeding demo data...'))

        # Admin
        if not User.objects.filter(username='admin').exists():
            u = User.objects.create_superuser('admin', 'admin@smarthire.com', 'admin123')
            u.role = 'admin'; u.first_name = 'Admin'; u.save()
            self.stdout.write('  Created: admin / admin123')

        # Recruiters
        for username, fname, company in [
            ('recruiter1', 'Rahul', 'TechCorp India'),
            ('recruiter2', 'Priya', 'StartupXYZ'),
        ]:
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(username, f'{username}@company.com', 'pass1234')
                u.role = 'recruiter'; u.first_name = fname; u.save()
                RecruiterProfile.objects.create(user=u, company_name=company,
                    industry='IT', is_verified=True)
                self.stdout.write(f'  Created: {username} / pass1234')

        # Job Seekers
        seekers = [
            ('seeker1', 'Amit', 'Kumar', 'Python, Django, SQL, HTML, CSS', 2, 'Bangalore'),
            ('seeker2', 'Sneha', 'Verma', 'React, JavaScript, TypeScript, CSS', 3, 'Mumbai'),
            ('seeker3', 'Raj', 'Singh', 'Python, Machine Learning, pandas', 1, 'Hyderabad'),
        ]
        for username, first, last, skills, exp, loc in seekers:
            if not User.objects.filter(username=username).exists():
                u = User.objects.create_user(username, f'{username}@gmail.com', 'pass1234')
                u.role = 'jobseeker'; u.first_name = first; u.last_name = last; u.location = loc; u.save()
                JobSeekerProfile.objects.create(user=u, skills=skills,
                    experience_years=exp, preferred_location=loc)
                self.stdout.write(f'  Created: {username} / pass1234')

        # Jobs
        rec1 = User.objects.get(username='recruiter1')
        rec2 = User.objects.get(username='recruiter2')
        count = 0
        for i, data in enumerate(JOBS):
            recruiter = rec1 if i % 2 == 0 else rec2
            if not Job.objects.filter(title=data['title']).exists():
                try:
                    company = recruiter.recruiter_profile
                except Exception:
                    company = None
                Job.objects.create(
                    recruiter=recruiter, company=company,
                    title=data['title'], skills_required=data['skills'],
                    job_type=data['job_type'], experience_level=data['experience_level'],
                    location=data['location'],
                    salary_min=data.get('salary_min'), salary_max=data.get('salary_max'),
                    description=data['description'],
                    requirements=data.get('requirements', ''),
                    is_remote=data.get('is_remote', False),
                    status='active', openings=2,
                )
                count += 1
        self.stdout.write(f'  Created: {count} jobs')

        self.stdout.write(self.style.SUCCESS('\nDone! Login credentials:'))
        self.stdout.write('  Admin:     admin / admin123   →  /admin/')
        self.stdout.write('  Recruiter: recruiter1 / pass1234')
        self.stdout.write('  Recruiter: recruiter2 / pass1234')
        self.stdout.write('  Seeker:    seeker1 / pass1234')
        self.stdout.write('  Seeker:    seeker2 / pass1234')
        self.stdout.write('  Seeker:    seeker3 / pass1234')
