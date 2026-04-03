import random

from django.shortcuts import render, redirect
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .tokens import email_confirmation_token_generator
from django.core.mail import send_mail
from .email_utils import send_confirmation_email, send_password_reset_email, send_login_email

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes

from rest_framework import serializers as drf_serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, Famille, Defunt, Paiement
from .serializers import UserSerializer, FamilleSerializer, DefuntSerializer, PaiementSerializer


def landing_view(request):
    return render(request, "landing.html")


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
@permission_classes([AllowAny]) # Tout le monde peut s'inscrire
def register_user(request):

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
            
        send_confirmation_email(user)
        
        return Response({
            "message": "Utilisateur créé ! Vérifiez votre boîte mail pour votre identité.",
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
        refresh = TokenObtainPairSerializer.get_token(user)
        return Response({
            "message": f"Bienvenue {user.name} !",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)
        
    user.is_active = True
    user.save()

    refresh = TokenObtainPairSerializer.get_token(user)
    access = str(refresh.access_token)
    refresh_str = str(refresh)

    return Response({"access": access, "refresh": refresh_str}, status=status.HTTP_200_OK)


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
        send_confirmation_email(user)
        return Response(
            {"error": "Ce compte n'est pas activé. Vérifiez votre boîte mail."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not user.check_password(password):
        return Response(
            {"error": "Email ou mot de passe incorrect."},
            status=status.HTTP_400_BAD_REQUEST
        )

    code = str(random.randint(100000, 999999))
    user.validate_code = code
    user.save()
    
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_confirmation_token_generator.make_token(user)

    # Envoi de l'email de notification
    send_login_email(user)

    return Response({
        "message": "Connexion réussie. Un email de confirmation a été envoyé.",
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
        refresh = TokenObtainPairSerializer.get_token(user)
        return Response({
            "message": f"Connexion réussie, bienvenue {user.name} .",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)
        
    user.is_active = True
    user.save()

    refresh = TokenObtainPairSerializer.get_token(user)
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
def resend_confirmation_email(request):
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
                send_login_email(user)
        
        elif action == "register":
            if not user.is_active:
                send_confirmation_email(user)
                
        elif action == "forgot-password":
            if user.is_active:
                send_password_reset_email(user)
                
        else:
            return Response(
                {"message": "Données invalides."},
                status=status.HTTP_400_BAD_REQUEST
            )

    except User.DoesNotExist:
        pass

    return Response(
        {"message": "Si un compte existe avec cet email, un nouveau lien a été envoyé."},
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
            send_password_reset_email(user)
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
        return Response(
            {"error": "Le lien de réinitialisation est invalide ou a expiré."},
            status=status.HTTP_400_BAD_REQUEST
        )

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
    password_confirm = request.data.get('password_confirm', '')

    if not uid or not token or not password or not password_confirm:
        return Response(
            {"error": "Tous les champs sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != password_confirm:
        return Response(
            {"error": "Les mots de passe ne correspondent pas."},
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
    description="Retourne les informations du profil de l'utilisateur connecté (id, nom, email, rôle).",
    responses={
        200: inline_serializer(
            name="UserProfileResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "name": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(),
                "role": drf_serializers.CharField(),
            }
        ),
    },
)
@extend_schema(
    tags=["Profil"],
    methods=["PUT"],
    summary="Mettre à jour le profil de l'utilisateur connecté",
    description="Permet de mettre à jour le nom et/ou l'email de l'utilisateur connecté. L'email doit être unique et valide. Si l'email est changé, un email de confirmation est envoyé et le compte doit être réactivé.",
    request=UserSerializer,
    responses={
        200: inline_serializer(
            name="UserProfileUpdateResponse",
            fields={
                "id": drf_serializers.UUIDField(),
                "name": drf_serializers.CharField(),
                "email": drf_serializers.EmailField(),
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
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    if request.method == 'GET':
        return Response({ "id": request.user.id, "name": request.user.name, "email": request.user.email, "role": request.user.role })
    
    if request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({ "id": request.user.id, "name": request.user.name, "email": request.user.email, "role": request.user.role })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        request.user.delete()
        return Response({"message": "Utilisateur supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)


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





