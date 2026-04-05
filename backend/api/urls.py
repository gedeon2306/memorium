from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    landing_view,
    register,
    confirm_register,
    login,
    confirm_login,
    resend_email,
    forgot_password,
    confirm_password,
    reset_password_confirm,
    get_user_profile,
    update_password,
)

urlpatterns = [
    ## Auth routes
    # Inscription (envoi d'un email de confirmation)
    path('auth/register/', register, name='register'),
    
    # Confirmation de l'email (lien cliqué dans le mail)
    path('auth/confirm-register/<str:uidb64>/<str:token>/', confirm_register, name='confirm_register'),
    
    # Connexion (envoi du mail avec le code de connexion)
    path('auth/login/', login, name='login'),
    
    # Confirmation de la connexion (Génère le JWT Access et Refresh)
    path('auth/confirm-login/', confirm_login, name='confirm_login'),
    
    # Rafraîchir le token (quand le premier expire)
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Renvoi de l'email de confirmation (si le lien(token) a expiré)
    path('auth/resend-email/', resend_email, name='resend_email'),
    
    # Mot de passe oublié
    path('auth/forgot-password/', forgot_password, name='forgot_password'),
    path('auth/confirm-password/<str:uidb64>/<str:token>/', confirm_password, name='confirm_password'),
    path('auth/reset-password-confirm/', reset_password_confirm, name='reset_password_confirm'),
    
    ## User profile routes
    # Récupération du profil utilisateur, mettre à jour les infos du profil (sauf mot de passe), et supprimer le compte 
    path('user/profile/', get_user_profile, name='user_profile'),
    
    # Mise à jour du mot de passe
    path('user/update-password/', update_password, name='update_password'),
]
