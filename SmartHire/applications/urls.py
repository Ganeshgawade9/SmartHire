from django.urls import path
from . import views
urlpatterns = [
    path('apply/<int:job_pk>/', views.apply_job, name='apply_job'),
    path('my/', views.my_applications, name='my_applications'),
    path('<int:pk>/', views.application_detail, name='application_detail'),
    path('<int:pk>/status/', views.update_status, name='update_application_status'),
    path('<int:pk>/withdraw/', views.withdraw_application, name='withdraw_application'),
    path('<int:app_pk>/interview/', views.schedule_interview, name='schedule_interview'),
    path('job/<int:job_pk>/', views.job_applications, name='job_applications'),
]
