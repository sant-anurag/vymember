from django.urls import path
from . import views

urlpatterns = [
    # Dashboard and Home
    path('', views.dashboard, name='dashboard'),  # Main dashboard
    path('dashboard/', views.dashboard, name='dashboard'),  # Dashboard (explicit)
    path('home/', views.home, name='home'),  # Home page

    # Authentication
    path('login/', views.login_view, name='login'),  # Login page
    path('logout/', views.logout_view, name='logout'),  # Logout
    path('forgot/', views.forgot_password, name='forgot_password'),  # Forgot password
    path('reset/<str:token>/', views.reset_password, name='reset_password'),  # Password reset

    # Member Management
    path('register_member/', views.register_member, name='register_member'),  # Register member
    path('member/', views.register_member, name='member'),  # Register member (alias)
    path('all_members/', views.all_members, name='all_members'),  # List all members
    path('upload_members/', views.upload_members, name='upload_members'),  # Upload members

    # Instructor Management
    path('add-instructor/', views.add_instructor, name='add_instructor'),  # Add instructor
    path('add_public_instructor/', views.add_public_instructor, name='add_public_instructor'),  # Add public instructor
    path('all_instructors/', views.all_instructors, name='all_instructors'),  # List all instructors

    # Instructor Infographics
    path('instructor_infographics/', views.instructor_infographics, name='instructor_infographics'),  # Infographics page
    path('api/instructor-infographics-data', views.api_instructor_infographics_data, name='api_instructor_infographics_data'),  # Infographics data API
    path('api/instructor-details/<int:instructor_id>', views.api_instructor_details, name='api_instructor_details'),  # Instructor details API
    path('api/download-instructor-report', views.api_download_instructor_report, name='api_download_instructor_report'),  # Download instructor report

    # User Management
    path('register_user/', views.register_user, name='register_user'),  # Register user
    path('create-user/', views.create_user, name='create_user'),  # Create user
    path('get-user-details/<int:user_id>/', views.get_user_details, name='get_user_details'),  # Get user details
    path('update-user/<int:user_id>/', views.update_user, name='update_user'),  # Update user
    path('change-password/', views.change_password, name='change_password'),  # Change password

    # Member API Endpoints
    # path('api/members/', views.api_members, name='api_members'),  # (Commented out)
    path('api/member/<int:member_id>/', views.get_member_detail, name='get_member_detail'),  # Get member detail
    path('api/member/<int:member_id>/update/', views.update_member, name='update_member'),  # Update member
    path('api/member/<int:member_id>/delete/', views.delete_member, name='delete_member'),  # Delete member

    # Instructor API Endpoints
    path('api/instructors/<int:instructor_id>/', views.api_instructor_detail, name='api_instructor_detail'),  # Get instructor detail
    path('api/instructors_update/<int:instructor_id>/', views.api_instructor_update, name='api_instructor_update'),  # Update instructor

    # Event Management
    path('events/add/', views.add_event, name='add_event'),  # Add event
    path('events/attendance/', views.record_attendance, name='record_attendance'),  # Record attendance
    path('events/', views.view_events, name='view_events'),  # View events
    path('events/download/', views.download_event_attendance, name='download_event_attendance'),  # Download event attendance
    path('upload-attendance/', views.upload_attendance, name='upload_attendance'),  # Upload attendance

    # AJAX Endpoints
    path('ajax/countries/', views.get_countries, name='ajax_countries'),  # Get countries
    path('ajax/states/', views.get_states, name='ajax_states'),  # Get states
    path('ajax/cities/', views.get_cities, name='ajax_cities'),  # Get cities
    path('ajax/events/', views.ajax_events, name='ajax_events'),  # Get events (AJAX)
    path('ajax/events/edit/', views.ajax_events_edit, name='ajax_events_edit'),  # Edit events (AJAX)
    path('ajax/events/download/', views.ajax_events_download, name='ajax_events_download'),  # Download events (AJAX)
    path('ajax/events', views.ajax_eventsbyDate, name='ajax_events'),  # Events by date (AJAX)

    # Session Management
    path('session_timeout/', views.session_timeout, name='session_timeout'),  # Session timeout

    # Public Registration
    path('public_register/', views.public_register, name='public_register'),  # Public registration

    # Dashboard Metrics API
    path('dashboard/api/metrics/', views.dashboard_metrics_api, name='dashboard_metrics_api'),  # Dashboard metrics API
    path('thank_you/', views.thank_you, name='thank_you'),
    path('reset-password/<str:token>/', views.reset_password_public, name='reset_password_public'),
    path('reset-password/', views.reset_password_public, name='reset_password_public'),
    path('ajax/check_by_phone/', views.check_member_by_phone, name='check_member_by_phone'),
    # member_manage/urls.py
    path('download_members/', views.download_members_page, name='download_members_page'),
    path('download_members_excel/', views.download_members, name='download_members_excel'),
    path('api/member_count/', views.api_member_count, name='api_member_count'),
]