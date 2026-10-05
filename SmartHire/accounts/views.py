from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from .forms import RegisterForm, LoginForm, UserUpdateForm, JobSeekerProfileForm, RecruiterProfileForm
from .models import JobSeekerProfile, RecruiterProfile


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            with transaction.atomic():
                user = form.save(commit=False)
                user.role = form.cleaned_data['role']
                user.save()
                if user.role == 'jobseeker':
                    JobSeekerProfile.objects.create(user=user)
                else:
                    RecruiterProfile.objects.create(user=user, company_name='My Company')
            login(request, user)
            messages.success(request, f'Welcome to SmartHire, {user.first_name}!')
            return redirect('dashboard')
    else:
        form = RegisterForm()
    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = LoginForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.first_name or user.username}!')
            return redirect(request.GET.get('next', 'dashboard'))
    else:
        form = LoginForm()
    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('home')


@login_required
def profile_view(request):
    user = request.user
    profile_form = None

    if user.is_jobseeker():
        profile, _ = JobSeekerProfile.objects.get_or_create(user=user)
        ProfileFormClass = JobSeekerProfileForm
        profile_form = ProfileFormClass(request.POST or None, request.FILES or None, instance=profile)
    elif user.is_recruiter():
        profile, _ = RecruiterProfile.objects.get_or_create(user=user, defaults={'company_name': 'My Company'})
        ProfileFormClass = RecruiterProfileForm
        profile_form = ProfileFormClass(request.POST or None, request.FILES or None, instance=profile)

    user_form = UserUpdateForm(request.POST or None, request.FILES or None, instance=user)

    if request.method == 'POST':
        forms_valid = user_form.is_valid()
        if profile_form:
            forms_valid = forms_valid and profile_form.is_valid()
        if forms_valid:
            user_form.save()
            if profile_form:
                profile_form.save()
            messages.success(request, 'Profile updated successfully!')
            return redirect('profile')

    return render(request, 'accounts/profile.html', {
        'user_form': user_form,
        'profile_form': profile_form,
    })
