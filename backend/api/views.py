import random
import string
import base64
import io
from io import BytesIO
from PIL import Image
from decimal import Decimal, InvalidOperation

from django.shortcuts import render, redirect
from django.conf import settings
from django.db import models
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.models import BaseUserManager

from .tokens import email_confirmation_token_generator
from .email_utils import send_confirmation_email, send_password_reset_email, send_login_email, send_new_email_code

from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes

from rest_framework import serializers as drf_serializers

from .models import User, Famille, Defunt, Paiement, LignePaiement
from .serializers import (
    UserSerializer, 
    FamilleSerializer, 
    DefuntSerializer, 
    PaiementSerializer, 
    LignePaiementSerializer,
    MyTokenObtainPairSerializer
)

from django.db.models import Q, Case, When, Value, IntegerField, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta


def landing_view(request):
    return render(request, "landing.html")


def _error_server():
    return Response({
        "error": "Une erreur est survenue, reesayez plus tard !"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _is_users_admin(user):
    return user.role == "Administrateur" or user.is_staff


def _forbidden(texte):
    return Response(
        {"error": f"Vous n'avez pas les droits pour {texte}."},
        status=status.HTTP_403_FORBIDDEN,
    )
    

@extend_schema(
    tags=["Auth"],
    summary="Créer un compte utilisateur",
    description="Crée un nouvel utilisateur avec les données fournies. Envoie un email de confirmation pour activer le compte.",
    request=UserSerializer,
    responses={
        201: inline_serializer(
            name="RegisterSuccess",
            fields={
                "message": drf_serializers.CharField(),
                "user": inline_serializer(
                    name="RegisterUserInfo",
                    fields={
                        "email": drf_serializers.EmailField(),
                        "name": drf_serializers.CharField(),
                    }
                ),
            }
        ),
        400: inline_serializer(
            name="RegisterError",
            fields={
                "errors": drf_serializers.DictField(
                    child=drf_serializers.ListField(child=drf_serializers.CharField()),
                    help_text="Dictionnaire des erreurs par champ"
                )
            }
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):

    if len(request.data.get('password', '')) < 8:
        return Response(
            {"error": "Le mot de passe doit contenir au moins 8 caractères."},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    email_user = request.data.get('email', '').strip().lower()
    if not email_user:
        return Response({"email": "L'email est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.filter(email=email_user).first()
    if user:
        if not user.is_active:
            send_confirmation_email(user)
            return Response({
                "message": "Vérifiez votre boîte mail pour confirmer votre identité.",
                "user": {"email": user.email, "name": user.name}
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Cet utilisateur est déjà actif."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        is_first_user = User.objects.count() == 0
        
        user = serializer.save()
        
        if is_first_user:
            user.role = 'Administrateur'
            user.save()
            
        try:
            send_confirmation_email(user)
        except:
            _error_server()
            
        return Response({
            "message": "Compte créé ! Vérifiez votre boîte mail pour votre identité.",
            "user": {"email": user.email, "name": user.name}
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=["Auth"],
    summary="Confirmer l'email de l'utilisateur et le connecter automatiquement",
    description="Valide le jeton de confirmation. Si valide, active le compte et retourne une paire de jetons JWT (Access/Refresh).",
    responses={
        200: inline_serializer(
            name="ConfirmationSuccess",
            fields={
                "message": drf_serializers.CharField(),
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
            }
        ),
        400: inline_serializer(
            name="ConfirmationError",
            fields={
                "error": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(required=False),
            }
        ),
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_register(request, uidb64, token):
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Lien de confirmation invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if not email_confirmation_token_generator.check_token(user, token):
        return Response({
            "error": "Lien de confirmation invalide ou expiré.",
            "email": user.email
        }, status=status.HTTP_400_BAD_REQUEST)

    if user.is_active:
        refresh = MyTokenObtainPairSerializer.get_token(user)
        return Response({
            "message": f"Bienvenue {user.name} !",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)
        
    user.is_active = True
    user.save()

    refresh = MyTokenObtainPairSerializer.get_token(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    return Response({
        "message": f"Bienvenue {user.name} !",
        "access": str(refresh.access_token),
        "refresh": str(refresh)
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Connexion utilisateur avec envoi d'email",
    description="Valide les identifiants de l'utilisateur (email/mot de passe). Si valides, envoie un email de notification de connexion et retourne les jetons JWT (Access/Refresh).",
    request=inline_serializer(
        name="LoginRequest",
        fields={
            "email": drf_serializers.EmailField(),
            "password": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="LoginSuccess",
            fields={
                "message": drf_serializers.CharField(),
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
            }
        ),
        400: inline_serializer(
            name="LoginError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {"error": "L'email et le mot de passe sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Email ou mot de passe incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.is_active:
        try:
            send_confirmation_email(user)
        except:
            _error_server()
            
        return Response(
            {"error": "Ce compte n'est pas activé. Vérifiez votre boîte mail."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(password):
        return Response(
            {"error": "Email ou mot de passe incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.dfa:
        refresh = MyTokenObtainPairSerializer.get_token(user)
        return Response({
            "message": f"Connexion réussie, bienvenue {user.name} .",
            "dfa": user.dfa,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)

    code = str(random.randint(100000, 999999))
    user.validate_code = code
    user.save()
    
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_confirmation_token_generator.make_token(user)

    # Envoi de l'email de notification
    try:
        send_login_email(user)
    except:
        _error_server()

    return Response({
        "message": "Connexion réussie. Un email de confirmation a été envoyé.",
        "dfa": user.dfa,
        "uid": uidb64,
        "token": token
    }, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Confirmer le code de connexion envoyé par email",
    description="Valide le code de connexion envoyé par email. Si valide, retourne les jetons JWT (Access/Refresh).",
    request=inline_serializer(
        name="LoginConfirmationRequest",
        fields={
            "uidb64": drf_serializers.CharField(),
            "token": drf_serializers.CharField(),
            "code": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="LoginConfirmationSuccess",
            fields={
                "message": drf_serializers.CharField(),
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
            }
        ),
        400: inline_serializer(
            name="LoginConfirmationError",
            fields={
                "error": drf_serializers.CharField(),
            }
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_login(request):
    uidb64 = request.data.get('uid', '')
    token = request.data.get('token', '')
    code = request.data.get('code', '')
    
    if not uidb64 or not token or not code:
        return Response({"error": "Données de confirmation manquantes."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Lien de confirmation invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if not email_confirmation_token_generator.check_token(user, token):
        return Response({
            "error": "Lien de confirmation invalide ou expiré.",
            "email": user.email
        }, status=status.HTTP_400_BAD_REQUEST)
        
    if user.validate_code != code:
        return Response({"error": "Code de confirmation incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    
    user.validate_code = ''
    user.save()

    if user.is_active:
        refresh = MyTokenObtainPairSerializer.get_token(user)
        return Response({
            "message": f"Connexion réussie, bienvenue {user.name} .",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)
        
    user.is_active = True
    user.save()

    refresh = MyTokenObtainPairSerializer.get_token(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    return Response({"message": f"Connexion réussie, bienvenue {user.name} .", "access": access, "refresh": refresh_str}, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Auth"],
    summary="Renvoyer un email (confirmation ou réinitialisation)",
    description="Permet de renvoyer un email de confirmation pour l'inscription ou un email de réinitialisation de mot de passe. Ne divulgue pas si l'email existe ou non pour des raisons de sécurité.",
    request=inline_serializer(
        name="ResendEmailRequest",
        fields={
            "email": drf_serializers.EmailField(),
            "action": drf_serializers.ChoiceField(choices=["inscription", "forgot-password"])
        }
    ),
    responses={
        200: inline_serializer(
            name="ResendEmailSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ResendEmailError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def resend_email(request):
    email = request.data.get('email', '').strip().lower()
    action = request.data.get('action', '')

    if not email:
        return Response(
            {"error": "L'adresse email est obligatoire."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        if action == "login":
            if user.is_active:
                user.validate_code = str(random.randint(100000, 999999))
                user.save()
                
                uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
                token = email_confirmation_token_generator.make_token(user)
                
                try:
                    send_login_email(user)
                except:
                    _error_server()
                    
                return Response({
                    "message": "Un nouveau code a été envoyé à votre email.",
                    "uid": uidb64,
                    "token": token,
                    },
                    status=status.HTTP_200_OK
                )
        
        elif action == "register":
            if not user.is_active:
                try:
                    send_confirmation_email(user)
                except:
                    _error_server()
                
        elif action == "forgot-password":
            if user.is_active:
                try:
                    send_password_reset_email(user)
                except:
                    _error_server()
                
        else:
            return Response(
                {"message": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST
            )

    except User.DoesNotExist:
        pass

    return Response(
        {"message": "Un nouveau lien a été envoyé."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Demander un email de réinitialisation de mot de passe",
    description="Envoie un email de réinitialisation de mot de passe si l'email existe et est actif. Ne divulgue pas si l'email existe ou non pour des raisons de sécurité.",
    request=inline_serializer(
        name="ForgotPasswordRequest",
        fields={
            "email": drf_serializers.EmailField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ForgotPasswordSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ForgotPasswordError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    
    email = request.data.get('email', '').strip().lower()

    if not email:
        return Response(
            {"error": "L'adresse email est obligatoire."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)

        if user.is_active:
            try:
                send_password_reset_email(user)
            except:
                _error_server()
        else:
            pass

    except User.DoesNotExist:
        pass

    return Response(
        {"message": "Email de réinitialisation envoyé ! Vérifiez votre boîte mail."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Confirmer le token pour reinitialiser le mot de passe",
    description="Valide le token de réinitialisation de mot de passe. Si valide, retourne l'uid et le token pour permettre au frontend d'afficher un formulaire de nouveau mot de passe.",
    request=inline_serializer(
        name="PasswordConfirmRequest",
        fields={
            "uid": drf_serializers.CharField(),
            "token": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="PasswordConfirmSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="PasswordConfirmError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_password(request, uidb64, token):
    
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Lien de confirmation invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if not email_confirmation_token_generator.check_token(user, token):
        return Response({
            "error": "Le lien de réinitialisation est invalide ou a expiré.",
            "email": user.email
        }, status=status.HTTP_400_BAD_REQUEST)

    return Response(
        {"uid": uid, "token": token},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Auth"],
    summary="Réinitialiser le mot de passe avec un token",
    description="Valide le token de réinitialisation et change le mot de passe. Après set_password(), le token est automatiquement invalidé car Django utilise le hash du mot de passe dans le token.",
    request=inline_serializer(
        name="ResetPasswordConfirmRequest",
        fields={
            "uid": drf_serializers.CharField(),
            "token": drf_serializers.CharField(),
            "password": drf_serializers.CharField(),
            "password_confirm": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ResetPasswordConfirmSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ResetPasswordConfirmError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request):
    
    uid = request.data.get('uid', '')
    token = request.data.get('token', '')
    password = request.data.get('password', '')

    if not uid or not token or not password:
        return Response(
            {"error": "Tous les champs sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {"error": "Le mot de passe doit contenir au moins 8 caractères."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response(
            {"error": "Lien de confirmation invalide."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not email_confirmation_token_generator.check_token(user, token):
        return Response(
            {"error": "Le lien de réinitialisation est invalide ou a expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.set_password(password)
    user.save()

    return Response(
        {"message": "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter."},
        status=status.HTTP_200_OK
    )


@extend_schema(
    tags=["Profil"],
    methods=["GET"],
    summary="Récupérer le profil de l'utilisateur connecté",
    description="Retourne les informations du profil de l'utilisateur connecté (id, photo, nom, email, rôle).",
    responses={
        200: inline_serializer(
            name="UserProfileResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "photo": drf_serializers.CharField(),
                "name": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(),
                "role": drf_serializers.CharField(),
            }
        ),
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["POST"],
    summary="Confirmer le nouvel email de l'utilisateur connecté",
    description="L'email doit être unique et valide. Email de confirmation est envoyé avec un code.",
    request=inline_serializer(
        name="ConfirmEmailRequest",
        fields={
            "email": drf_serializers.EmailField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ConfirmEmailSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ConfirmEmailError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["PUT"],
    summary="Mettre à jour le profil de l'utilisateur connecté",
    description="Permet de mettre à jour le nom et/ou la photo de l'utilisateur connecté.",
    request=UserSerializer,
    responses={
        200: inline_serializer(
            name="UserProfileUpdateResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "name": drf_serializers.CharField(),
                "photo": drf_serializers.CharField(),
            }
        ),
        400: inline_serializer(
            name="UserProfileUpdateError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["DELETE"],
    summary="Supprimer le compte de l'utilisateur connecté",
    description="Supprime définitivement le compte de l'utilisateur connecté. Cette action est irréversible.",
    responses={
        204: inline_serializer(
            name="UserDeleteResponse",
            fields={"message": drf_serializers.CharField()}
        ),
    },
)
@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def profil(request):
    if request.method == 'GET':
        return Response({ "id": request.user.id, "photo": request.user.photo, "name": request.user.name, "email": request.user.email, "role": request.user.role, "dfa": request.user.dfa })
    
    if request.method == 'POST':
        email_input = request.data.get('email')
        
        if not email_input:
            return Response({"error": "L'email est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        email = BaseUserManager.normalize_email(email_input).lower()
        
        if email == request.user.email:
            return Response({"error": "Cet email est déjà le vôtre."}, status=status.HTTP_400_BAD_REQUEST)
        
        email_exists = User.objects.filter(email=email).exclude(id=request.user.id).exists()

        if email_exists:
            return Response(
                {"error": "Email indisponible."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        code = str(random.randint(100000, 999999))
        user = request.user
        user.validate_code = code
        user.save()
        
        try:
            send_new_email_code(email, code)
        except:
            _error_server()
        
        return Response({
            "message": "Un email de confirmation a été envoyé à votre nouvelle adresse email.",
        }, status=status.HTTP_200_OK)
            
    if request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Données mise à jour avec succès.",
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        request.user.delete()
        return Response({"message": "Utilisateur supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)


@extend_schema(
    tags=["Profil"],
    methods=["PUT"],
    summary="Confirmer et mettre à jour l'email",
    description="Vérifie le code reçu par email et met à jour l'adresse email de l'utilisateur.",
    request=inline_serializer(
        name="ConfirmEmailRequest",
        fields={
            "email": drf_serializers.EmailField(),
            "code": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="ConfirmEmailSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="ConfirmEmailError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def confirm_new_email(request):
    email_raw = request.data.get('email')
    code = request.data.get('code')
    
    if not email_raw or not code:
        return Response({"error": "L'email et le code sont requis."}, status=status.HTTP_400_BAD_REQUEST)
    
    email = BaseUserManager.normalize_email(email_raw).lower()
    user = request.user

    if not user.validate_code or user.validate_code != code:
        return Response({"error": "Code de confirmation incorrect."}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exclude(id=user.id).exists():
        return Response({"error": "Cet email est désormais utilisé par un autre compte."}, status=status.HTTP_400_BAD_REQUEST)
    
    user.email = email
    user.validate_code = ""
    user.save()
    
    return Response({"message": "Votre adresse email a été mise à jour avec succès."}, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Profil"],
    summary="Changer le mot de passe de l'utilisateur connecté",
    description="Permet à l'utilisateur connecté de changer son mot de passe en fournissant le mot de passe actuel et le nouveau mot de passe. Le mot de passe actuel est vérifié avant de permettre le changement.",
    request=inline_serializer(
        name="UpdatePasswordRequest",
        fields={
            "currentPassword": drf_serializers.CharField(),
            "newPassword": drf_serializers.CharField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="UpdatePasswordSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="UpdatePasswordError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_password(request):
    currentPassword = request.data.get("currentPassword")
    newPassword = request.data.get("newPassword")
    
    if not currentPassword or not newPassword:
        return Response(
            {"error": "Les champs 'password' et 'newpassword' sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
    if currentPassword == newPassword:
        return Response(
            {"error": "Le nouveau mot de passe doit être différent de l'actuel."},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
    user = request.user
    if not user.check_password(currentPassword):
        return Response(
            {"error": "Mot de passe actuel incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )
        
    user.set_password(newPassword)
    user.save()
    return Response(
        {"message": "Mot de passe mis à jour avec succès."},
        status=status.HTTP_200_OK,
    )


def process_and_save_image(image_file, max_size_mb=5, output_size=(400, 400)):
    """
    Traite une image : valide, redimensionne et convertit en base64.
    
    Args:
        image_file: Fichier image du request
        max_size_mb: Taille maximale en MB (défaut 5)
        output_size: Tuple (width, height) pour le redimensionnement
        
    Returns:
        Dict avec {'success': bool, 'data': str ou 'error': str}
    """
    try:
        # Vérifier la taille du fichier
        file_size_mb = image_file.size / (1024 * 1024)
        if file_size_mb > max_size_mb:
            return {
                'success': False,
                'error': f'Fichier trop volumineux. Maximum {max_size_mb}MB, vous avez {file_size_mb:.2f}MB.'
            }
        
        # Valider que c'est une image
        try:
            img = Image.open(image_file)
            img.verify()
            # Réouvrir l'image après verify (qui la ferme)
            image_file.seek(0)
            img = Image.open(image_file)
        except Exception as e:
            return {
                'success': False,
                'error': 'Le fichier n\'est pas une image valide.'
            }
        
        # Convertir en RGB si nécessaire (pour les PNG avec transparence, etc.)
        if img.mode in ('RGBA', 'LA', 'P'):
            # Créer une image blanche comme fond
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Redimensionner l'image (maintenir l'aspect ratio)
        img.thumbnail(output_size, Image.Resampling.LANCZOS)
        
        # Optionnel : compresser l'image JPEG
        output = BytesIO()
        img.save(output, format='JPEG', quality=85, optimize=True)
        output.seek(0)
        
        # Convertir en base64 avec le préfixe data URI
        image_data = base64.b64encode(output.getvalue()).decode('utf-8')
        data_uri = f'data:image/jpeg;base64,{image_data}'
        
        return {
            'success': True,
            'data': data_uri
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Erreur lors du traitement de l\'image : {str(e)}'
        }


@extend_schema(
    tags=["Profil"],
    summary="Uploader une photo de profil",
    description="Upload et traite une photo de profil. L'image est redimensionnée, compressée et stockée en base64.",
    request=inline_serializer(
        name="UploadPhotoRequest",
        fields={
            "photo": drf_serializers.FileField(),
        }
    ),
    responses={
        200: inline_serializer(
            name="UploadPhotoSuccess",
            fields={"message": drf_serializers.CharField()}
        ),
        400: inline_serializer(
            name="UploadPhotoError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profil_photo(request):
    """
    Endpoint pour uploader la photo de profil.
    Reçoit une image, la traite et l'enregistre.
    """
    if 'photo' not in request.FILES:
        return Response(
            {"error": "Aucun fichier image fourni. Utilisez la clé 'photo'."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    image_file = request.FILES['photo']
    
    # Traiter l'image
    result = process_and_save_image(image_file)
    
    if not result['success']:
        return Response(
            {"error": result['error']},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Enregistrer dans la base de données
    try:
        user = request.user
        user.photo = result['data']
        user.save()
        
        return Response(
            {"message": "Photo de profil mise à jour avec succès."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": f"Erreur lors de l'enregistrement : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    tags=["Utilisateurs"],
    methods=["GET"],
    summary="Lister les utilisateurs",
    description="Retourne la liste des utilisateurs (réservé aux administrateurs).",
    responses={
        200: UserSerializer(many=True),
        403: inline_serializer(
            name="UsersListForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Utilisateurs"],
    methods=["POST"],
    summary="Créer un utilisateur",
    description="Crée un compte utilisateur actif (réservé aux administrateurs). Le mot de passe doit contenir au moins 8 caractères.",
    request=UserSerializer,
    responses={
        201: UserSerializer,
        400: inline_serializer(
            name="UsersCreateError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="UsersCreateForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Utilisateurs"],
    methods=["PUT"],
    summary="Mettre à jour un utilisateur",
    description="Met à jour un utilisateur par son identifiant (réservé aux administrateurs). Champs modifiables selon UserSerializer.",
    request=UserSerializer,
    responses={
        200: inline_serializer(
            name="UsersUpdateResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="UsersUpdateError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="UsersUpdateForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="UsersUpdateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Utilisateurs"],
    methods=["DELETE"],
    summary="Supprimer un utilisateur",
    description="Supprime un utilisateur par son identifiant (réservé aux administrateurs). Passer l'id en query (?id=) ou dans le corps.",
    responses={
        204: inline_serializer(
            name="UsersDeleteResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="UsersDeleteError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="UsersDeleteForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="UsersDeleteNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def users(request):
    if not _is_users_admin(request.user):
        return _forbidden('gérer les utilisateurs')

    if request.method == "GET":
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering", "name")

        ALLOWED_ORDERING = {
            "name-asc": "name",
            "name-desc": "-name",
            "role": "role",
            "recent": "-created_at",
        }
        order_field = ALLOWED_ORDERING.get(ordering, "name")

        users = User.objects.all()

        if search:
            users = users.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
            )

        users = users.order_by(order_field)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    if request.method == "POST":
        data = request.data.copy()
        data["password"] = "memoriumUtilisateurDefaut"
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response({"message": "Utilisateur créé avec succès !"}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        user_id = request.data.get("id")
        if not user_id:
            return Response(
                {"error": "L'identifiant utilisateur (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Utilisateur introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        payload = {k: v for k, v in request.data.items() if k != "id"}
        serializer = UserSerializer(target, data=payload, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Données mise à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        user_id = request.query_params.get("id") or request.data.get("id")
        if not user_id:
            return Response(
                {"error": "L'identifiant utilisateur (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if str(user_id) == str(request.user.id):
            return Response(
                {"error": "Vous ne pouvez pas supprimer votre propre compte depuis cette action."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Utilisateur introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        target.delete()
        return Response(
            {"message": "Utilisateur supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    tags=["Familles"],
    methods=["GET"],
    summary="Lister les familles",
    description="Retourne la liste des familles (utilisateurs authentifiés).",
    responses={
        200: FamilleSerializer(many=True),
    },
)
@extend_schema(
    tags=["Familles"],
    methods=["POST"],
    summary="Créer une famille",
    description="Crée une famille ; le créateur est associé automatiquement (champ user).",
    request=FamilleSerializer,
    responses={
        201: FamilleSerializer,
        400: inline_serializer(
            name="FamillesCreateError",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Familles"],
    methods=["PUT"],
    summary="Mettre à jour une famille",
    description="Met à jour une famille par son identifiant. Champs modifiables selon FamilleSerializer.",
    request=FamilleSerializer,
    responses={
        200: inline_serializer(
            name="FamillesUpdateResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="FamillesUpdateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="FamillesUpdateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Familles"],
    methods=["DELETE"],
    summary="Supprimer une famille",
    description="Supprime une famille par son identifiant (réservé aux administrateurs). Passer l'id en query (?id=) ou dans le corps.",
    responses={
        204: inline_serializer(
            name="FamillesDeleteResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="FamillesDeleteError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="FamillesDeleteForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="FamillesDeleteNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def familles(request):

    if request.method == "GET":
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering", "name")

        ALLOWED_ORDERING = {
            "name-asc": "nom_famille",
            "name-desc": "-nom_famille",
            "profession": "profession",
            "recent": "-created_at",
        }
        order_field = ALLOWED_ORDERING.get(ordering, "nom_famille")

        familles_qs = Famille.objects.all()

        if search:
            familles_qs = familles_qs.filter(
                Q(nom_famille__icontains=search)
                | Q(nom_garrant__icontains=search)
                | Q(email__icontains=search)
                | Q(telephone__icontains=search)
            )

        familles_qs = familles_qs.order_by(order_field)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(familles_qs, request)
        serializer = FamilleSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    if request.method == "POST":
        data = request.data.copy()
        data["email"] = BaseUserManager.normalize_email(data["email"]).lower()
        serializer = FamilleSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Famille créée avec succès !"},
                status=status.HTTP_201_CREATED,
            )
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        famille_id = request.data.get("id")
        if not famille_id:
            return Response(
                {"error": "L'identifiant famille (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Famille.objects.get(pk=famille_id)
        except Famille.DoesNotExist:
            return Response(
                {"error": "Famille introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        payload = {k: v for k, v in request.data.items() if k != "id"}
        serializer = FamilleSerializer(target, data=payload, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Données mise à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if not _is_users_admin(request.user):
            return _forbidden('supprimer une famille')

        famille_id = request.query_params.get("id") or request.data.get("id")
        if not famille_id:
            return Response(
                {"error": "L'identifiant famille (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Famille.objects.get(pk=famille_id)
        except Famille.DoesNotExist:
            return Response(
                {"error": "Famille introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        target.delete()
        return Response(
            {"message": "Famille supprimée avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    tags=["Défunts"],
    methods=["GET"],
    summary="Lister les défunts",
    description="Retourne la liste des défunts (utilisateurs authentifiés).",
    responses={
        200: DefuntSerializer(many=True),
    },
)
@extend_schema(
    tags=["Défunts"],
    methods=["POST"],
    summary="Créer un défunt",
    description="Crée un défunt avec une place unique (1-250), génère automatiquement un paiement et une ligne de paiement. Le champ famille est requis.",
    request=inline_serializer(
        name="DefuntCreateRequest",
        fields={
            "nom": drf_serializers.CharField(),
            "prenom": drf_serializers.CharField(required=False),
            "genre": drf_serializers.ChoiceField(choices=[('M', 'Masculin'), ('F', 'Féminin')]),
            "age": drf_serializers.IntegerField(),
            "profession": drf_serializers.CharField(required=False),
            "date_naiss": drf_serializers.DateField(),
            "date_deces": drf_serializers.DateField(),
            "date_inhumation": drf_serializers.DateField(),
            "date_incineration": drf_serializers.DateField(),
            "famille": drf_serializers.UUIDField(),
            "montant": drf_serializers.DecimalField(required=False, max_digits=10, decimal_places=2),
            "motif": drf_serializers.CharField(required=False),
            "moyen_paiement": drf_serializers.CharField(required=False),
        },
    ),
    responses={
        201: inline_serializer(
            name="DefuntCreateResponse",
            fields={
                "message": drf_serializers.CharField(),
                "defunt": DefuntSerializer(),
                "paiement": inline_serializer(
                    name="PaiementInfo",
                    fields={
                        "num_facture": drf_serializers.CharField(),
                        "montant": drf_serializers.DecimalField(max_digits=10, decimal_places=2),
                    },
                ),
            },
        ),
        400: inline_serializer(
            name="DefuntsCreateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="DefuntsCreateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Défunts"],
    methods=["PUT"],
    summary="Mettre à jour un défunt",
    description="Met à jour un défunt par son identifiant. Champs modifiables selon DefuntSerializer.",
    request=DefuntSerializer,
    responses={
        200: inline_serializer(
            name="DefuntsUpdateResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="DefuntsUpdateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="DefuntsUpdateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Défunts"],
    methods=["DELETE"],
    summary="Supprimer un défunt",
    description="Supprime un défunt par son identifiant (réservé aux administrateurs). Passer l'id en query (?id=) ou dans le corps.",
    responses={
        204: inline_serializer(
            name="DefuntsDeleteResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="DefuntsDeleteError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="DefuntsDeleteForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="DefuntsDeleteNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def defunts(request):

    if request.method == "GET":
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering", "name")

        ALLOWED_ORDERING = {
            "name-asc": "nom",
            "name-desc": "-nom",
            "age-asc": "age",
            "age-desc": "-age",
            "statut-incinere": "statut",
            "statut-inhume": "-statut",
            "recent": "-created_at",
        }
        order_field = ALLOWED_ORDERING.get(ordering, "nom")

        defunts_qs = Defunt.objects.all()

        if search:
            defunts_qs = defunts_qs.filter(
                Q(nom__icontains=search)
                | Q(prenom__icontains=search)
                | Q(profession__icontains=search)
                | Q(famille__nom_famille__icontains=search)
            )

        
        defunts_qs = defunts_qs.order_by(order_field)

        paginator = PageNumberPagination()
        paginator.page_size = 25
        result_page = paginator.paginate_queryset(defunts_qs, request)
        serializer = DefuntSerializer(result_page, many=True)
        
        # Récupérer toutes les familles pour le selecteur
        families_qs = Famille.objects.all().order_by('nom_famille')
        families_serializer = FamilleSerializer(families_qs, many=True)
        
        # Construire la réponse avec les défunts et les familles
        response_data = {
            'results': serializer.data,
            'families': families_serializer.data
        }
        
        return paginator.get_paginated_response(response_data)

    if request.method == "POST":
        data = request.data.copy()
        
        # Generate random unique place between 1 and 250
        import random
        existing_places = Defunt.objects.values_list('place', flat=True).exclude(place__isnull=True)
        available_places = [i for i in range(1, 251) if i not in existing_places]
        
        if not available_places:
            return Response(
                {"error": "Plus aucune place disponible."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        place = random.choice(available_places)
        data['place'] = place
        
        # Generate unique invoice number
        while True:
            invoice_num = f"INV-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
            if not Paiement.objects.filter(num_facture=invoice_num).exists():
                break
        
        # Get montant from request or use default
        montant = data.get('montant', '0.00')
        
        # Validate required fields for payment
        if 'famille' not in data or not data['famille']:
            return Response(
                {"error": "Le champ famille est requis pour créer un paiement."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            famille = Famille.objects.get(pk=data['famille'])
        except Famille.DoesNotExist:
            return Response(
                {"error": "Famille introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Create Defunt
        serializer = DefuntSerializer(data=data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        defunt = serializer.save()
        
        # Create Paiement
        paiement = Paiement.objects.create(
            num_facture=invoice_num,
            famille=famille,
            user=request.user,
            total_amount=montant
        )
        
        # Create LignePaiement
        LignePaiement.objects.create(
            paiement=paiement,
            motif='Inhumation',
            montant=montant,
            moyen_paiement=data.get('moyen_paiement', 'Espèces'),
            defunt=defunt
        )
        
        return Response(
            {"message": "Défunt créé avec succès !"},
            status=status.HTTP_201_CREATED
        )

    if request.method == "PUT":
        defunt_id = request.data.get("id")
        if not defunt_id:
            return Response(
                {"error": "L'identifiant défunt (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Defunt.objects.get(pk=defunt_id)
        except Defunt.DoesNotExist:
            return Response(
                {"error": "Défunt introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        payload = {k: v for k, v in request.data.items() if k != "id"}
        serializer = DefuntSerializer(target, data=payload, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Données mise à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if not _is_users_admin(request.user):
            return _forbidden('supprimer un défunt')

        defunt_id = request.query_params.get("id") or request.data.get("id")
        if not defunt_id:
            return Response(
                {"error": "L'identifiant défunt (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Defunt.objects.get(pk=defunt_id)
        except Defunt.DoesNotExist:
            return Response(
                {"error": "Défunt introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        target.delete()
        return Response(
            {"message": "Défunt supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    tags=["Défunts"],
    methods=["PUT"],
    summary="Changer le statut d'un défunt",
    description="Change le statut d'un défunt de 'Inhumé' à 'Incinéré' et libère la place (met à 0).",
    request=inline_serializer(
        name="DefuntStatusRequest",
        fields={
            "id": drf_serializers.CharField(),
        },
    ),
    responses={
        200: DefuntSerializer,
        400: inline_serializer(
            name="DefuntStatusError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="DefuntStatusNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def defunt_change_statut(request):
    if not _is_users_admin(request.user):
        return Response(
            {"error": "Vous n'avez pas les permissions pour modifier le statut d'un défunt."},
            status=status.HTTP_403_FORBIDDEN,
        )

    defunt_id = request.data.get("id")
    if not defunt_id:
        return Response(
            {"error": "L'identifiant du défunt (id) est requis."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        target = Defunt.objects.get(pk=defunt_id)
    except Defunt.DoesNotExist:
        return Response(
            {"error": "Défunt introuvable."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Vérifier que le statut actuel est "Inhumé"
    if target.statut != "Inhumé":
        return Response(
            {"error": "Le défunt est déjà inhumé."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Changer le statut en "Incinéré" et libérer la place
    target.statut = "Incinéré"
    target.place = None
    target.save()

    serializer = DefuntSerializer(target)
    return Response({
        "message": "Statut du défunt changé avec succès. Place libérée."},
        status=status.HTTP_200_OK,
    )


@extend_schema(
    tags=["Paiements"],
    methods=["GET"],
    summary="Lister les paiements",
    description="Retourne la liste des paiements (utilisateurs authentifiés).",
    responses={
        200: PaiementSerializer(many=True),
    },
)
@extend_schema(
    tags=["Paiements"],
    methods=["POST"],
    summary="Créer un paiement",
    description="Crée un paiement avec ses lignes de paiement associées.",
    request=inline_serializer(
        name="PaiementCreateRequest",
        fields={
            "famille": drf_serializers.UUIDField(),
            "total_amount": drf_serializers.DecimalField(max_digits=10, decimal_places=2),
            "lignes": drf_serializers.ListField(
                child=inline_serializer(
                    name="LignePaiementRequest",
                    fields={
                        "motif": drf_serializers.CharField(),
                        "montant": drf_serializers.DecimalField(max_digits=10, decimal_places=2),
                        "moyen_paiement": drf_serializers.CharField(),
                        "defunt": drf_serializers.UUIDField(),
                    },
                )
            ),
        },
    ),
    responses={
        201: PaiementSerializer,
        400: inline_serializer(
            name="PaiementsCreateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="PaiementsCreateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Paiements"],
    methods=["PUT"],
    summary="Mettre à jour un paiement",
    description="Met à jour un paiement par son identifiant. Champs modifiables selon PaiementSerializer.",
    request=PaiementSerializer,
    responses={
        200: inline_serializer(
            name="PaiementsUpdateResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="PaiementsUpdateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="PaiementsUpdateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Paiements"],
    methods=["DELETE"],
    summary="Supprimer un paiement",
    description="Supprime un paiement par son identifiant (réservé aux administrateurs). Passer l'id en query (?id=) ou dans le corps.",
    responses={
        204: inline_serializer(
            name="PaiementsDeleteResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="PaiementsDeleteError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="PaiementsDeleteForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="PaiementsDeleteNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def paiements(request):

    if request.method == "GET":
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering", "num_facture")

        ALLOWED_ORDERING = {
            "num_facture": "num_facture",
            "num_facture-desc": "-num_facture",
            "amount": "total_amount",
            "amount-desc": "-total_amount",
            "recent": "-date_paiement",
        }
        order_field = ALLOWED_ORDERING.get(ordering, "recent")

        paiements_qs = Paiement.objects.all()

        if search:
            paiements_qs = paiements_qs.filter(
                Q(num_facture__icontains=search)
                | Q(famille__nom_famille__icontains=search)
                | Q(user__name__icontains=search)
            )

        paiements_qs = paiements_qs.order_by(order_field)

        paginator = PageNumberPagination()
        paginator.page_size = 12
        result_page = paginator.paginate_queryset(paiements_qs, request)
        serializer = PaiementSerializer(result_page, many=True)
        
        # Récupérer toutes les familles pour le selecteur
        families_qs = Famille.objects.all().order_by('nom_famille')
        families_serializer = FamilleSerializer(families_qs, many=True)
        
        # Récupérer tous les défunts pour le selecteur
        defunts_qs = Defunt.objects.all().order_by('nom')
        defunts_serializer = DefuntSerializer(defunts_qs, many=True)
        
        response_data = {
            'results': serializer.data,
            'families': families_serializer.data,
            'defunts': defunts_serializer.data
        }
        
        return paginator.get_paginated_response(response_data)

    if request.method == "POST":
        data = request.data.copy()
        
        # Generate unique invoice number
        while True:
            invoice_num = f"INV-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}"
            if not Paiement.objects.filter(num_facture=invoice_num).exists():
                break
        
        # Validate required fields
        if 'famille' not in data or not data['famille']:
            return Response(
                {"error": "Le champ famille est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate total_amount format
        total_amount = data.get('total_amount', '0.00')
        try:
            # Validate decimal format with max_digits=10, decimal_places=2
            decimal_amount = Decimal(str(total_amount))
            if decimal_amount < 0:
                return Response(
                    {"error": "Le montant total ne peut pas être négatif."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Check if it fits in DecimalField(max_digits=10, decimal_places=2)
            if decimal_amount * 100 >= 10**8:  # max_digits=10, decimal_places=2 means max value is 99999999.99
                return Response(
                    {"error": "Le montant total est trop grand (maximum: 99,999,999.99 XAF)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (ValueError, TypeError, InvalidOperation):
            return Response(
                {"error": "Le montant total doit être un nombre valide avec au maximum 2 décimales."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            famille = Famille.objects.get(pk=data['famille'])
        except Famille.DoesNotExist:
            return Response(
                {"error": "Famille introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Create Paiement
        paiement = Paiement.objects.create(
            num_facture=invoice_num,
            famille=famille,
            user=request.user,
            total_amount=data.get('total_amount', '0.00')
        )
        
        # Create LignePaiement if provided
        lignes_data = data.get('lignes', [])
        for ligne_data in lignes_data:
            # Validate defunt exists
            if 'defunt' in ligne_data and ligne_data['defunt']:
                try:
                    defunt = Defunt.objects.get(pk=ligne_data['defunt'])
                except Defunt.DoesNotExist:
                    return Response(
                        {"error": f"Défunt {ligne_data['defunt']} introuvable."},
                        status=status.HTTP_404_NOT_FOUND,
                    )
            else:
                defunt = None
            
            # Validate montant format for each ligne
            ligne_montant = ligne_data.get('montant', '0.00')
            try:
                # Validate decimal format with max_digits=10, decimal_places=2
                decimal_ligne_montant = Decimal(str(ligne_montant))
                if decimal_ligne_montant < 0:
                    return Response(
                        {"error": "Le montant d'une ligne ne peut pas être négatif."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                # Check if it fits in DecimalField(max_digits=10, decimal_places=2)
                if decimal_ligne_montant * 100 >= 10**8:  # max_digits=10, decimal_places=2 means max value is 99999999.99
                    return Response(
                        {"error": "Le montant d'une ligne est trop grand (maximum: 99,999,999.99 XAF)."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except (ValueError, TypeError, InvalidOperation):
                return Response(
                    {"error": "Le montant d'une ligne doit être un nombre valide avec au maximum 2 décimales."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
                
            LignePaiement.objects.create(
                paiement=paiement,
                motif=ligne_data.get('motif', 'Inhumation'),
                montant=ligne_montant,  # Use validated montant
                moyen_paiement=ligne_data.get('moyen_paiement', 'Espèces'),
                defunt=defunt
            )
        
        return Response(
            {
                "message": "Paiement créé avec succès !",
                "paiement": PaiementSerializer(paiement).data
            },
            status=status.HTTP_201_CREATED,
        )

    if request.method == "PUT":
        paiement_id = request.data.get("id")
        if not paiement_id:
            return Response(
                {"error": "L'identifiant paiement (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Paiement.objects.get(pk=paiement_id)
        except Paiement.DoesNotExist:
            return Response(
                {"error": "Paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        payload = {k: v for k, v in request.data.items() if k != "id"}
        serializer = PaiementSerializer(target, data=payload, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Données mise à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if not _is_users_admin(request.user):
            return _forbidden('supprimer un paiement')

        paiement_id = request.query_params.get("id") or request.data.get("id")
        if not paiement_id:
            return Response(
                {"error": "L'identifiant paiement (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            target = Paiement.objects.get(pk=paiement_id)
        except Paiement.DoesNotExist:
            return Response(
                {"error": "Paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        target.delete()
        return Response(
            {"message": "Paiement supprimé avec succès."},
            status=status.HTTP_204_NO_CONTENT,
        )


@extend_schema(
    tags=["Lignes Paiements"],
    methods=["GET"],
    summary="Lister les lignes de paiement",
    description="Retourne la liste des lignes de paiement pour un paiement spécifique ou toutes les lignes.",
    responses={
        200: LignePaiementSerializer(many=True),
    },
)
@extend_schema(
    tags=["Lignes Paiements"],
    methods=["POST"],
    summary="Créer une ligne de paiement",
    description="Crée une ligne de paiement et recalcule automatiquement le total du paiement.",
    request=LignePaiementSerializer,
    responses={
        201: LignePaiementSerializer,
        400: inline_serializer(
            name="LignesPaiementsCreateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="LignesPaiementsCreateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Lignes Paiements"],
    methods=["PUT"],
    summary="Mettre à jour une ligne de paiement",
    description="Met à jour une ligne de paiement et recalcule automatiquement le total du paiement.",
    request=LignePaiementSerializer,
    responses={
        200: inline_serializer(
            name="LignesPaiementsUpdateResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="LignesPaiementsUpdateError",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="LignesPaiementsUpdateNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@extend_schema(
    tags=["Lignes Paiements"],
    methods=["DELETE"],
    summary="Supprimer une ligne de paiement",
    description="Supprime une ligne de paiement et recalcule automatiquement le total du paiement (réservé aux administrateurs).",
    responses={
        204: inline_serializer(
            name="LignesPaiementsDeleteResponse",
            fields={"message": drf_serializers.CharField()},
        ),
        400: inline_serializer(
            name="LignesPaiementsDeleteError",
            fields={"error": drf_serializers.CharField()},
        ),
        403: inline_serializer(
            name="LignesPaiementsDeleteForbidden",
            fields={"error": drf_serializers.CharField()},
        ),
        404: inline_serializer(
            name="LignesPaiementsDeleteNotFound",
            fields={"error": drf_serializers.CharField()},
        ),
    },
)
@api_view(["GET", "POST", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def lignes_paiements(request):
    
    def recalculate_paiement_total(paiement_id):
        """Recalculate total amount for a payment based on its lines"""
        try:
            paiement = Paiement.objects.get(pk=paiement_id)
            total = paiement.lignes.aggregate(total=models.Sum('montant'))['total'] or 0
            paiement.total_amount = total
            paiement.save()
            return paiement
        except Paiement.DoesNotExist:
            return None

    if request.method == "GET":
        paiement_id = request.query_params.get("paiement_id")
        search = request.query_params.get("search", "").strip()
        ordering = request.query_params.get("ordering", "motif")

        ALLOWED_ORDERING = {
            "motif": "motif",
            "motif-desc": "-motif",
            "montant": "montant",
            "montant-desc": "-montant",
        }
        order_field = ALLOWED_ORDERING.get(ordering, "motif")

        lignes_qs = LignePaiement.objects.all()
        
        if paiement_id:
            lignes_qs = lignes_qs.filter(paiement_id=paiement_id)

        if search:
            lignes_qs = lignes_qs.filter(
                Q(motif__icontains=search)
                | Q(moyen_paiement__icontains=search)
                | Q(paiement__num_facture__icontains=search)
                | Q(defunt__nom__icontains=search)
            )

        lignes_qs = lignes_qs.order_by(order_field)

        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(lignes_qs, request)
        serializer = LignePaiementSerializer(result_page, many=True)
        
        # Récupérer tous les défunts pour le selecteur
        defunts_qs = Defunt.objects.all().order_by('nom')
        defunts_serializer = DefuntSerializer(defunts_qs, many=True)
        
        response_data = {
            'results': serializer.data,
            'defunts': defunts_serializer.data
        }
        
        return paginator.get_paginated_response(response_data)

    if request.method == "POST":
        if not _is_users_admin(request.user):
            return _forbidden('ajouter une ligne')
        
        data = request.data.copy()
        
        # Validate required fields
        if 'paiement' not in data or not data['paiement']:
            return Response(
                {"error": "Le champ paiement est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            paiement = Paiement.objects.get(pk=data['paiement'])
        except Paiement.DoesNotExist:
            return Response(
                {"error": "Paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Validate defunt if provided
        if 'defunt' in data and data['defunt']:
            try:
                Defunt.objects.get(pk=data['defunt'])
            except Defunt.DoesNotExist:
                return Response(
                    {"error": "Défunt introuvable."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        # Validate montant format
        montant = data.get('montant', '0.00')
        try:
            # Validate decimal format with max_digits=10, decimal_places=2
            decimal_montant = Decimal(str(montant))
            if decimal_montant < 0:
                return Response(
                    {"error": "Le montant ne peut pas être négatif."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # Check if it fits in DecimalField(max_digits=10, decimal_places=2)
            if decimal_montant * 100 >= 10**8:  # max_digits=10, decimal_places=2 means max value is 99999999.99
                return Response(
                    {"error": "Le montant est trop grand (maximum: 99,999,999.99 XAF)."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (ValueError, TypeError, InvalidOperation):
            return Response(
                {"error": "Le montant doit être un nombre valide avec au maximum 2 décimales."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        serializer = LignePaiementSerializer(data=data)
        if serializer.is_valid():
            ligne = serializer.save()
            
            # Recalculate payment total
            recalculate_paiement_total(paiement.id)
            
            return Response(
                LignePaiementSerializer(ligne).data,
                status=status.HTTP_201_CREATED,
            )
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "PUT":
        if not _is_users_admin(request.user):
            return _forbidden('modifier une ligne')
        
        ligne_id = request.data.get("id")
        if not ligne_id:
            return Response(
                {"error": "L'identifiant ligne (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            ligne = LignePaiement.objects.get(pk=ligne_id)
        except LignePaiement.DoesNotExist:
            return Response(
                {"error": "Ligne de paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        # Validate defunt if provided
        if 'defunt' in request.data and request.data['defunt']:
            try:
                Defunt.objects.get(pk=request.data['defunt'])
            except Defunt.DoesNotExist:
                return Response(
                    {"error": "Défunt introuvable."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        
        payload = {k: v for k, v in request.data.items() if k != "id"}
        serializer = LignePaiementSerializer(ligne, data=payload, partial=True)
        
        if serializer.is_valid():
            ligne = serializer.save()
            
            # Recalculate payment total
            recalculate_paiement_total(ligne.paiement.id)
            
            return Response(
                {
                    "message": "Ligne de paiement mise à jour avec succès.",
                    "ligne": LignePaiementSerializer(ligne).data
                },
                status=status.HTTP_200_OK,
            )
        
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        if not _is_users_admin(request.user):
            return _forbidden('supprimer une ligne')

        ligne_id = request.query_params.get("id") or request.data.get("id")
        if not ligne_id:
            return Response(
                {"error": "L'identifiant ligne (id) est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            ligne = LignePaiement.objects.get(pk=ligne_id)
            paiement_id = ligne.paiement.id
            ligne.delete()
            
            # Recalculate payment total
            recalculate_paiement_total(paiement_id)
            
            return Response(
                {"message": "Ligne de paiement supprimée avec succès."},
                status=status.HTTP_204_NO_CONTENT,
            )
        except LignePaiement.DoesNotExist:
            return Response(
                {"error": "Ligne de paiement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )


@extend_schema(
    tags=["Map"],
    summary="Récupérer la liste des défunts avec place assignée",
    description="Retourne la liste de tous les défunts où le champ 'place' n'est pas null.",
    responses={
        200: DefuntSerializer(many=True),
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def map(request):
    
    defunts_with_place = Defunt.objects.filter(place__isnull=False).order_by('place')
    serializer = DefuntSerializer(defunts_with_place, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=["Dashboard"],
    summary="Récupérer les statistiques du tableau de bord",
    description="Retourne les statistiques principales pour le tableau de bord : nombre de défunts, trous disponibles, utilisateurs, et transactions récentes.",
    responses={
        200: inline_serializer(
            name="DashboardResponse",
            fields={
                "statistics": drf_serializers.DictField(),
                "recent_transactions": drf_serializers.ListField(),
                "progress_data": drf_serializers.ListField(),
            }
        ),
        403: inline_serializer(
            name="DashboardError",
            fields={"error": drf_serializers.CharField()}
        ),
    },
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    
    try:
        # Statistiques principales
        total_defunts = Defunt.objects.count()
        total_users = User.objects.filter(is_active=True).count()
        
        # Statistiques par genre
        defunts_masculins = Defunt.objects.filter(genre='M').count()
        defunts_feminins = Defunt.objects.filter(genre='F').count()
        
        # Statistiques par âge (majeur/mineur)
        defunts_majeurs = Defunt.objects.filter(age__gte=18).count()
        defunts_mineurs = Defunt.objects.filter(age__lt=18).count()
        
        # Calcul des trous disponibles (simulé - basé sur le nombre total de places)
        total_trous = 250  # Valeur fixe comme dans le frontend
        trous_disponibles = total_trous - total_defunts
        
        # Transactions récentes (paiements et créations de défunts)
        recent_paiements = Paiement.objects.select_related('user', 'famille').order_by('-date_paiement')[:3]
        recent_defunts = Defunt.objects.select_related('user', 'famille').order_by('-created_at')[:2]
        
        # Combiner et formater les transactions
        transactions = []
        
        # Ajouter les paiements récents
        for paiement in recent_paiements:
            user_name = paiement.user.name if paiement.user else "Système"
            transactions.append({
                "id": f"#P-{paiement.num_facture}",
                "user": user_name,
                "type": "Paiement",
                "date": paiement.date_paiement.strftime("%d %B %Y"),
                "status": "Validé"
            })
        
        # Ajouter les défunts récents
        for defunt in recent_defunts:
            user_name = defunt.user.name if defunt.user else "Système"
            transactions.append({
                "id": f"#D-{str(defunt.id)[:8]}",
                "user": user_name,
                "type": "Ajout défunt",
                "date": defunt.created_at.strftime("%d %B %Y"),
                "status": "Validé"
            })
        
        # Trier par date
        transactions.sort(key=lambda x: x['date'], reverse=True)
        transactions = transactions[:5]  # Limiter à 5 transactions
        
        # Données de progression pour les barres
        progress_data = [
            {
                "label": "Trous occupés",
                "value": round((total_defunts / total_trous) * 100) if total_trous > 0 else 0,
                "color": "progress-primary"
            },
            {
                "label": "Défunts Masculins",
                "value": round((defunts_masculins / total_defunts) * 100) if total_defunts > 0 else 0,
                "color": "progress-success"
            },
            {
                "label": "Défunts Féminins",
                "value": round((defunts_feminins / total_defunts) * 100) if total_defunts > 0 else 0,
                "color": "progress-warning"
            },
            {
                "label": "Défunts Majeurs",
                "value": round((defunts_majeurs / total_defunts) * 100) if total_defunts > 0 else 0,
                "color": "progress-error"
            },
            {
                "label": "Défunts Mineurs",
                "value": round((defunts_mineurs / total_defunts) * 100) if total_defunts > 0 else 0,
                "color": "progress-info"
            }
        ]
        
        # Statistiques finales
        statistics = {
            "total_defunts": total_defunts,
            "total_trous": total_trous,
            "trous_disponibles": trous_disponibles,
            "total_users": total_users,
            "defunts_masculins": defunts_masculins,
            "defunts_feminins": defunts_feminins,
            "defunts_majeurs": defunts_majeurs,
            "defunts_mineurs": defunts_mineurs
        }
        
        return Response({
            "statistics": statistics,
            "recent_transactions": transactions,
            "progress_data": progress_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return _error_server()




