from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Home page
    path('login/', views.login_view, name='login'),
    path('register_member/', views.register_member, name='register_member'),
    # Add other URLs here
]