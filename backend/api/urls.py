from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register,
    confirm_register,
    login,
    confirm_login,
    resend_email,
    forgot_password,
    confirm_password,
    reset_password_confirm,
    profil,
    confirm_new_email,
    update_password,
    upload_profil_photo,
    users,
    familles,
    defunts,
    paiements,
    lignes_paiements,
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
    # Récupération du profil utilisateur, envoyer un code pour mettre a jour l'email, mettre à jour les infos du profil (sauf mot de passe et email), et supprimer le compte 
    path('user/profil/', profil, name='user_profil'),
    
    # Confirmer et mettre à jour l'email
    path('user/confirm-new-email/', confirm_new_email, name='confirm_new_email'),
    
    # Mise à jour du mot de passe
    path('user/update-password/', update_password, name='update_password'),
    
    # Upload de la photo de profil
    path('user/upload-photo/', upload_profil_photo, name='upload_profil_photo'),
    
    # Gestion des utilisateurs (réservé aux administrateurs)
    path('admin/users/', users, name='admin_users'),

    # Gestion des familles (suppression réservée aux administrateurs)
    path('dashboard/familles/', familles, name='dashboard_familles'),
    
    # Gestion des defunts (suppression réservée aux administrateurs)
    path('dashboard/defunts/', defunts, name='dashboard_defunts'),
    
    # Gestion des paiements (suppression réservée aux administrateurs)
    path('dashboard/paiements/', paiements, name='dashboard_paiements'),
    
    # Gestion des lignes paiements (suppression réservée aux administrateurs)
    path('dashboard/lignes_paiements/', lignes_paiements, name='dashboard_lignes_paiements'),
]
