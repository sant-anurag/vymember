from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),  # Home page
    path('home/', views.home, name='home'),  # Home page
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register_member/', views.register_member, name='register_member'),
    path('add-instructor/', views.add_instructor, name='add_instructor'),
    path('member/', views.register_member, name='member'),
    path('all_members/', views.all_members, name='all_members'),

    # API endpoints
    #path('api/members/', views.api_members, name='api_members'),
    path('api/member/<int:member_id>/', views.get_member_detail, name='get_member_detail'),
    path('api/member/<int:member_id>/update/', views.update_member, name='update_member'),
    path('api/member/<int:member_id>/delete/', views.delete_member, name='delete_member'),
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
    path('change-password/', views.change_password, name='change_password'),
    path('create-user/', views.create_user, name='create_user'),
    path('get-user-details/<int:user_id>/', views.get_user_details, name='get_user_details'),
    path('update-user/<int:user_id>/', views.update_user, name='update_user'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/api/metrics/', views.dashboard_metrics_api, name='dashboard_metrics_api'),
    path('api/instructors/<int:instructor_id>/', views.api_instructor_detail, name='api_instructor_detail'),
    path('api/instructors_update/<int:instructor_id>/', views.api_instructor_update, name='api_instructor_update'),
    path('events/add/', views.add_event, name='add_event'),
    path('events/attendance/', views.record_attendance, name='record_attendance'),
    path('ajax/countries/', views.get_countries, name='ajax_countries'),
    path('ajax/states/', views.get_states, name='ajax_states'),
    path('ajax/cities/', views.get_cities, name='ajax_cities'),
    path('session_timeout/', views.session_timeout, name='session_timeout'),
    path('forgot/', views.forgot_password, name='forgot_password'),
    path('reset/<str:token>/', views.reset_password, name='reset_password'),
    path('events/', views.view_events, name='view_events'),
    path('events/download/', views.download_event_attendance, name='download_event_attendance'),
    path('upload-attendance/', views.upload_attendance, name='upload_attendance'),
    path('ajax/events/', views.ajax_events, name='ajax_events'),
    path('ajax/events/edit/', views.ajax_events_edit, name='ajax_events_edit'),
    path('ajax/events/download/', views.ajax_events_download, name='ajax_events_download'),

    path('public_register/', views.public_register, name='public_register'),

]