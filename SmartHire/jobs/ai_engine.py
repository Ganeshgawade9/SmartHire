"""AI Resume Screening & Job Recommendation Engine"""
from collections import Counter


def calculate_match_score(job_skills, candidate_skills):
    job_set = set(s.lower().strip() for s in job_skills)
    cand_set = set(s.lower().strip() for s in candidate_skills)
    if not job_set:
        return {'score': 0, 'matched': [], 'missing': [], 'badge': 'secondary', 'recommendation': 'N/A'}
    matched = list(job_set & cand_set)
    missing = list(job_set - cand_set)
    score = int(len(matched) / len(job_set) * 100)
    if score >= 80:
        badge, rec = 'success', 'Highly Recommended'
    elif score >= 60:
        badge, rec = 'primary', 'Good Match'
    elif score >= 40:
        badge, rec = 'warning', 'Partial Match'
    else:
        badge, rec = 'danger', 'Low Match'
    return {'score': score, 'matched': matched, 'missing': missing, 'badge': badge, 'recommendation': rec}


def get_recommendations(user, limit=8):
    from .models import Job
    try:
        profile = user.jobseeker_profile
        candidate_skills = profile.get_skills_list()
    except Exception:
        return Job.objects.filter(status='active')[:limit]

    jobs = Job.objects.filter(status='active').select_related('recruiter', 'company')

    if profile.preferred_location:
        loc_jobs = jobs.filter(location__icontains=profile.preferred_location)
        if loc_jobs.exists():
            jobs = loc_jobs
    if profile.job_type_preference:
        type_jobs = jobs.filter(job_type=profile.job_type_preference)
        if type_jobs.exists():
            jobs = type_jobs

    if not candidate_skills:
        return jobs[:limit]

    scored = []
    for job in jobs:
        result = calculate_match_score(job.get_skills_list(), candidate_skills)
        scored.append((job, result['score']))
    scored.sort(key=lambda x: x[1], reverse=True)
    return [j for j, s in scored[:limit]]


def get_skill_gaps(user):
    from .models import Job
    try:
        candidate_skills = set(user.jobseeker_profile.get_skills_list())
    except Exception:
        return []
    missing_count = Counter()
    for job in Job.objects.filter(status='active'):
        for skill in job.get_skills_list():
            if skill not in candidate_skills:
                missing_count[skill] += 1
    return missing_count.most_common(12)
