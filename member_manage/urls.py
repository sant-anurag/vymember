from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Home page
    path('login/', views.login_view, name='login'),
    path('register_member/', views.register_member, name='register_member'),
    path('add-instructor/', views.add_instructor, name='add_instructor'),
    path('member/', views.register_member, name='member'),
]