from django.urls import path
from . import views

urlpatterns = [
    path('builder/', views.resume_builder, name='resume_builder'),
    path('api/analyze-project/', views.analyze_project_api, name='analyze_project_api'),
    path('api/polish-text/', views.polish_text_api, name='polish_text_api'),
    path('export/docx/', views.export_docx_api, name='export_docx_api'),
]
