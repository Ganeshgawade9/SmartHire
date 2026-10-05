from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator
from collections import Counter

from .models import Job, SavedJob
from .forms import JobPostForm, JobSearchForm
from .ai_engine import calculate_match_score, get_recommendations, get_skill_gaps


def home(request):
    featured_jobs = Job.objects.filter(status='active').select_related('company', 'recruiter')[:6]
    total_jobs = Job.objects.filter(status='active').count()
    all_skills = []
    for job in Job.objects.filter(status='active')[:50]:
        all_skills.extend(job.get_skills_list())
    popular_skills = [s for s, c in Counter(all_skills).most_common(12)]
    return render(request, 'jobs/home.html', {
        'featured_jobs': featured_jobs,
        'total_jobs': total_jobs,
        'popular_skills': popular_skills,
    })


def job_list(request):
    form = JobSearchForm(request.GET)
    jobs = Job.objects.filter(status='active').select_related('recruiter', 'company')

    if form.is_valid():
        q = form.cleaned_data.get('q')
        location = form.cleaned_data.get('location')
        job_type = form.cleaned_data.get('job_type')
        experience_level = form.cleaned_data.get('experience_level')
        is_remote = form.cleaned_data.get('is_remote')
        if q:
            jobs = jobs.filter(
                Q(title__icontains=q) | Q(skills_required__icontains=q) |
                Q(description__icontains=q) | Q(company__company_name__icontains=q)
            )
        if location:
            jobs = jobs.filter(location__icontains=location)
        if job_type:
            jobs = jobs.filter(job_type=job_type)
        if experience_level:
            jobs = jobs.filter(experience_level=experience_level)
        if is_remote:
            jobs = jobs.filter(is_remote=True)

    skill = request.GET.get('skill')
    if skill:
        jobs = jobs.filter(skills_required__icontains=skill)

    paginator = Paginator(jobs, 10)
    jobs_page = paginator.get_page(request.GET.get('page', 1))
    saved_ids = []
    if request.user.is_authenticated:
        saved_ids = list(SavedJob.objects.filter(user=request.user).values_list('job_id', flat=True))

    return render(request, 'jobs/job_list.html', {
        'jobs': jobs_page,
        'form': form,
        'saved_ids': saved_ids,
        'total_count': paginator.count,
    })


def job_detail(request, pk):
    job = get_object_or_404(Job, pk=pk)
    Job.objects.filter(pk=pk).update(views_count=job.views_count + 1)
    already_applied = False
    match_result = None
    is_saved = False

    if request.user.is_authenticated and request.user.is_jobseeker():
        from applications.models import Application
        already_applied = Application.objects.filter(job=job, applicant=request.user).exists()
        is_saved = SavedJob.objects.filter(user=request.user, job=job).exists()
        try:
            skills = request.user.jobseeker_profile.get_skills_list()
            if skills:
                match_result = calculate_match_score(job.get_skills_list(), skills)
        except Exception:
            pass

    related_jobs = Job.objects.filter(status='active', job_type=job.job_type).exclude(pk=pk)[:4]

    return render(request, 'jobs/job_detail.html', {
        'job': job,
        'already_applied': already_applied,
        'match_result': match_result,
        'related_jobs': related_jobs,
        'is_saved': is_saved,
    })


@login_required
def post_job(request):
    if not request.user.is_recruiter():
        messages.error(request, 'Only recruiters can post jobs.')
        return redirect('job_list')
    if request.method == 'POST':
        form = JobPostForm(request.POST)
        if form.is_valid():
            job = form.save(commit=False)
            job.recruiter = request.user
            try:
                job.company = request.user.recruiter_profile
            except Exception:
                pass
            job.save()
            messages.success(request, 'Job posted successfully!')
            return redirect('job_detail', pk=job.pk)
    else:
        form = JobPostForm()
    return render(request, 'jobs/post_job.html', {'form': form})


@login_required
def edit_job(request, pk):
    job = get_object_or_404(Job, pk=pk, recruiter=request.user)
    if request.method == 'POST':
        form = JobPostForm(request.POST, instance=job)
        if form.is_valid():
            form.save()
            messages.success(request, 'Job updated!')
            return redirect('job_detail', pk=job.pk)
    else:
        form = JobPostForm(instance=job)
    return render(request, 'jobs/post_job.html', {'form': form, 'job': job})


@login_required
def delete_job(request, pk):
    job = get_object_or_404(Job, pk=pk, recruiter=request.user)
    if request.method == 'POST':
        job.delete()
        messages.success(request, 'Job deleted.')
        return redirect('dashboard')
    return render(request, 'jobs/confirm_delete.html', {'job': job})


@login_required
def save_job(request, pk):
    if not request.user.is_jobseeker():
        return JsonResponse({'status': 'error'})
    job = get_object_or_404(Job, pk=pk)
    saved, created = SavedJob.objects.get_or_create(user=request.user, job=job)
    if not created:
        saved.delete()
        return JsonResponse({'status': 'unsaved'})
    return JsonResponse({'status': 'saved'})


@login_required
def recommendations_view(request):
    if not request.user.is_jobseeker():
        return redirect('job_list')
    recommended = get_recommendations(request.user)
    skill_gaps = get_skill_gaps(request.user)
    return render(request, 'jobs/recommendations.html', {
        'recommended_jobs': recommended,
        'skill_gaps': skill_gaps,
    })
