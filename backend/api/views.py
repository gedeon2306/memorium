import random
import base64
import io
from io import BytesIO
from PIL import Image

from django.shortcuts import render, redirect
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.models import BaseUserManager

from .tokens import email_confirmation_token_generator
from django.core.mail import send_mail
from .email_utils import send_confirmation_email, send_password_reset_email, send_login_email, send_new_email_code

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from drf_spectacular.utils import extend_schema, inline_serializer
from drf_spectacular.types import OpenApiTypes

from rest_framework import serializers as drf_serializers

from .models import User, Famille, Defunt, Paiement
from .serializers import UserSerializer, FamilleSerializer, DefuntSerializer, PaiementSerializer, MyTokenObtainPairSerializer


def landing_view(request):
    return render(request, "landing.html")


def _error_server():
    return Response({
        "error": "Une erreur est survenue, reesayez plus tard !"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
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
@permission_classes([AllowAny]) # Tout le monde peut s'inscrire
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


def _users_admin_forbidden():
    return Response(
        {"error": "Vous n'avez pas les droits pour gérer les utilisateurs."},
        status=status.HTTP_403_FORBIDDEN,
    )


def _is_users_admin(user):
    return user.role == "Administrateur" or user.is_staff


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
        return _users_admin_forbidden()

    if request.method == "GET":
        queryset = User.objects.all().order_by("name")
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if request.method == "POST":
        pwd = request.data.get("password") or ""
        if len(pwd) < 8:
            return Response(
                {"error": "Le mot de passe doit contenir au moins 8 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = True
            user.save(update_fields=["is_active"])
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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







