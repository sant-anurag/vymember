from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Home page
    path('login/', views.login_view, name='login'),
    path('register_member/', views.register_member, name='register_member'),
    path('add-instructor/', views.add_instructor, name='add_instructor'),
    path('member/', views.register_member, name='member'),
    path('all_members/', views.all_members, name='all_members'),

    # API endpoints
    path('api/members/', views.api_members, name='api_members'),
    path('api/members/<int:id>/', views.api_member_detail, name='api_member_detail'),
    # Add the all_instructors URL pattern
    path('all_instructors/', views.all_instructors, name='all_instructors'),
    path('register_user/', views.register_user, name='register_user'),
    # New URLs for instructor infographics
    path('instructor_infographics/', views.instructor_infographics, name='instructor_infographics'),

    # API endpoints for infographics data
    path('api/instructor-infographics-data', views.api_instructor_infographics_data, name='api_instructor_infographics_data'),
    path('api/instructor-details/<int:instructor_id>', views.api_instructor_details, name='api_instructor_details'),
    path('api/download-instructor-report', views.api_download_instructor_report, name='api_download_instructor_report'),
    path('upload_members/', views.upload_members, name='upload_members'),
    # ... other URLs ...
]