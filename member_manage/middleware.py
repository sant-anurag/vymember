# member_manage/middleware.py
from django.shortcuts import redirect
from django.urls import reverse

class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # List of paths that should not trigger session timeout
        allowed_paths = [
            reverse('login'),
            reverse('session_timeout'),
            reverse('register_user'),
            reverse('public_register'),
            reverse('add_public_instructor'),
            reverse('reset_password_public'),
            reverse('thank_you'),
            reverse('forgot_password'),
            reverse('ajax_countries'),
            reverse('ajax_states'),
            reverse('ajax_cities'),
            '/',
        ]
        # Allow all reset-password links (with or without token)
        if request.path.startswith('/member/reset-password/'):
            return self.get_response(request)
        if request.path not in allowed_paths:
            if not request.session.get('is_authenticated'):
                return redirect(reverse('session_timeout'))
        return self.get_response(request)