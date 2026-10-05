from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponseForbidden
from django import forms as dj_forms

from .models import Application, Interview
from jobs.models import Job
from jobs.ai_engine import calculate_match_score
from notifications.utils import create_notification


class ApplicationForm(dj_forms.ModelForm):
    class Meta:
        model = Application
        fields = ('cover_letter', 'resume')
        widgets = {
            'cover_letter': dj_forms.Textarea(attrs={
                'rows': 5, 'class': 'form-control',
                'placeholder': 'Why are you the right fit for this role?'
            })
        }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['resume'].widget.attrs['class'] = 'form-control'


class InterviewForm(dj_forms.ModelForm):
    class Meta:
        model = Interview
        fields = ('interview_type', 'scheduled_at', 'duration_minutes', 'meeting_link', 'venue', 'notes')
        widgets = {
            'scheduled_at': dj_forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
            'notes': dj_forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
        }
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for name, f in self.fields.items():
            if not f.widget.attrs.get('class'):
                f.widget.attrs['class'] = 'form-control'


@login_required
def apply_job(request, job_pk):
    job = get_object_or_404(Job, pk=job_pk, status='active')
    if not request.user.is_jobseeker():
        messages.error(request, 'Only job seekers can apply.')
        return redirect('job_detail', pk=job_pk)
    if Application.objects.filter(job=job, applicant=request.user).exists():
        messages.warning(request, 'You already applied for this job.')
        return redirect('job_detail', pk=job_pk)

    if request.method == 'POST':
        form = ApplicationForm(request.POST, request.FILES)
        if form.is_valid():
            app = form.save(commit=False)
            app.job = job
            app.applicant = request.user
            try:
                skills = request.user.jobseeker_profile.get_skills_list()
                result = calculate_match_score(job.get_skills_list(), skills)
                app.match_score = result['score']
            except Exception:
                pass
            app.save()
            create_notification(
                recipient=job.recruiter,
                title='New Application',
                message=f'{request.user.get_full_name() or request.user.username} applied for {job.title}',
                notif_type='application',
                link=f'/applications/{app.pk}/'
            )
            messages.success(request, 'Application submitted successfully!')
            return redirect('my_applications')
    else:
        form = ApplicationForm()
    return render(request, 'applications/apply.html', {'form': form, 'job': job})


@login_required
def my_applications(request):
    applications = Application.objects.filter(
        applicant=request.user
    ).select_related('job', 'job__company', 'job__recruiter')
    return render(request, 'applications/my_applications.html', {'applications': applications})


@login_required
def application_detail(request, pk):
    app = get_object_or_404(Application, pk=pk)
    if request.user != app.applicant and request.user != app.job.recruiter and not request.user.is_admin():
        return HttpResponseForbidden()
    return render(request, 'applications/detail.html', {
        'application': app,
        'interviews': app.interviews.all(),
    })


@login_required
def update_status(request, pk):
    app = get_object_or_404(Application, pk=pk)
    if request.user != app.job.recruiter and not request.user.is_admin():
        return HttpResponseForbidden()
    if request.method == 'POST':
        new_status = request.POST.get('status')
        notes = request.POST.get('recruiter_notes', '')
        if new_status in dict(Application.STATUS_CHOICES):
            app.status = new_status
            app.recruiter_notes = notes
            app.save()
            label = dict(Application.STATUS_CHOICES)[new_status]
            create_notification(
                recipient=app.applicant,
                title='Application Updated',
                message=f'Your application for {app.job.title} is now: {label}',
                notif_type='status_update',
                link=f'/applications/{pk}/'
            )
            messages.success(request, 'Status updated.')
    return redirect('application_detail', pk=pk)


@login_required
def schedule_interview(request, app_pk):
    app = get_object_or_404(Application, pk=app_pk)
    if request.user != app.job.recruiter:
        return HttpResponseForbidden()
    if request.method == 'POST':
        form = InterviewForm(request.POST)
        if form.is_valid():
            interview = form.save(commit=False)
            interview.application = app
            interview.save()
            app.status = 'interview_scheduled'
            app.save()
            create_notification(
                recipient=app.applicant,
                title='Interview Scheduled!',
                message=f'Interview for {app.job.title} on {interview.scheduled_at.strftime("%d %b %Y at %H:%M")}',
                notif_type='interview',
                link=f'/applications/{app_pk}/'
            )
            messages.success(request, 'Interview scheduled! Candidate notified.')
            return redirect('application_detail', pk=app_pk)
    else:
        form = InterviewForm()
    return render(request, 'applications/schedule_interview.html', {'form': form, 'application': app})


@login_required
def withdraw_application(request, pk):
    app = get_object_or_404(Application, pk=pk, applicant=request.user)
    if request.method == 'POST':
        app.status = 'withdrawn'
        app.save()
        messages.info(request, 'Application withdrawn.')
    return redirect('my_applications')


@login_required
def job_applications(request, job_pk):
    job = get_object_or_404(Job, pk=job_pk, recruiter=request.user)
    status_filter = request.GET.get('status', '')
    apps = job.applications.select_related('applicant').order_by('-match_score', '-applied_at')
    if status_filter:
        apps = apps.filter(status=status_filter)
    return render(request, 'applications/job_applications.html', {
        'job': job, 'applications': apps,
        'status_filter': status_filter,
        'status_choices': Application.STATUS_CHOICES,
    })
