from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.db.models import Count
from django.utils import timezone

from jobs.models import Job, SavedJob
from applications.models import Application, Interview
from notifications.models import Notification


@login_required
def dashboard(request):
    user = request.user
    if user.is_admin():
        return admin_dashboard(request)
    elif user.is_recruiter():
        return recruiter_dashboard(request)
    else:
        return jobseeker_dashboard(request)


def jobseeker_dashboard(request):
    user = request.user
    apps = Application.objects.filter(applicant=user).select_related('job', 'job__company')
    status_counts = {s: apps.filter(status=s).count() for s, _ in Application.STATUS_CHOICES}

    upcoming = Interview.objects.filter(
        application__applicant=user, status='scheduled',
        scheduled_at__gte=timezone.now()
    ).select_related('application__job').order_by('scheduled_at')[:5]

    saved = SavedJob.objects.filter(user=user).select_related('job')[:5]

    from jobs.ai_engine import get_recommendations
    recommended = get_recommendations(user, limit=4)

    return render(request, 'dashboard/jobseeker.html', {
        'applications': apps[:5],
        'total_applications': apps.count(),
        'status_counts': status_counts,
        'upcoming_interviews': upcoming,
        'saved_jobs': saved,
        'recommended_jobs': recommended,
    })


def recruiter_dashboard(request):
    user = request.user
    jobs = Job.objects.filter(recruiter=user)
    active_jobs = jobs.filter(status='active').count()
    total_apps = Application.objects.filter(job__recruiter=user).count()
    shortlisted = Application.objects.filter(job__recruiter=user, status='shortlisted').count()

    recent_apps = Application.objects.filter(
        job__recruiter=user
    ).select_related('applicant', 'job').order_by('-applied_at')[:8]

    upcoming = Interview.objects.filter(
        application__job__recruiter=user, status='scheduled',
        scheduled_at__gte=timezone.now()
    ).select_related('application__job', 'application__applicant').order_by('scheduled_at')[:5]

    job_stats = jobs.filter(status='active').annotate(
        app_count=Count('applications')
    ).order_by('-app_count')[:5]

    return render(request, 'dashboard/recruiter.html', {
        'jobs': jobs[:6], 'active_jobs': active_jobs, 'total_jobs': jobs.count(),
        'total_applications': total_apps, 'shortlisted': shortlisted,
        'recent_applications': recent_apps, 'upcoming_interviews': upcoming,
        'job_stats': job_stats,
    })


def admin_dashboard(request):
    from accounts.models import User
    from collections import Counter

    total_users = User.objects.count()
    total_jobs = Job.objects.count()
    active_jobs = Job.objects.filter(status='active').count()
    total_apps = Application.objects.count()

    recent_users = User.objects.order_by('-date_joined')[:10]
    recent_jobs = Job.objects.order_by('-created_at').select_related('recruiter')[:8]

    app_by_status = {label: Application.objects.filter(status=s).count()
                     for s, label in Application.STATUS_CHOICES}

    all_skills = []
    for job in Job.objects.filter(status='active'):
        all_skills.extend(job.get_skills_list())
    top_skills = Counter(all_skills).most_common(10)

    import json

    role_counts = {
        'Job Seekers': User.objects.filter(role='jobseeker').count(),
        'Recruiters': User.objects.filter(role='recruiter').count(),
        'Admins': User.objects.filter(role='admin').count(),
    }

    return render(request, 'dashboard/admin.html', {
        'total_users': total_users, 'total_jobs': total_jobs,
        'active_jobs': active_jobs, 'total_applications': total_apps,
        'recent_users': recent_users, 'recent_jobs': recent_jobs,
        'app_by_status': app_by_status, 'top_skills': top_skills,
        'role_counts': role_counts,
        'role_labels': json.dumps(list(role_counts.keys())),
        'role_values': json.dumps(list(role_counts.values())),
        'status_labels': json.dumps(list(app_by_status.keys())),
        'status_values': json.dumps(list(app_by_status.values())),
    })