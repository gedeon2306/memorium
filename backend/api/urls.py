from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    landing_view,
    register_user,
    confirm_email,
    login,
    confirm_login,
    resend_confirmation_email,
    forgot_password,
    password_confirm,
    reset_password_confirm,
    get_user_profile,
    update_password,
)

urlpatterns = [
    path('', landing_view, name='landing'),
    
    # Auth routes
    path('auth/register/', register_user, name='register'),
    path('auth/confirm/<str:uidb64>/<str:token>/', confirm_email, name='confirm_email'),
    path('auth/login/', login, name='login'),
    path('auth/confirm-login/', confirm_login, name='confirm_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/resend-email/', resend_confirmation_email, name='resend_email'),
    path('auth/forgot-password/', forgot_password, name='forgot_password'),
    path('auth/password-confirm/<str:uidb64>/<str:token>/', password_confirm, name='password_confirm'),
    path('auth/reset-password-confirm/', reset_password_confirm, name='reset_password_confirm'),
    
    # User profile routes
    path('user/profile/', get_user_profile, name='user_profile'),
    path('user/update-password/', update_password, name='update_password'),
]
