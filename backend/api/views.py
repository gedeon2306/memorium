from django.shortcuts import render, redirect
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .tokens import email_confirmation_token_generator
from django.core.mail import send_mail
from .email_utils import send_confirmation_email, send_password_reset_email

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
def confirm_email(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Lien de confirmation invalide."}, status=status.HTTP_400_BAD_REQUEST)

    if user is not None and not email_confirmation_token_generator.check_token(user, token):
        return Response({
            "error": "Lien de confirmation invalide ou expiré.",
            "email": user.email
        }, status=status.HTTP_400_BAD_REQUEST)

    if user is None:
        return Response({"error": "Lien de confirmation invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)

    if user.is_active:
        refresh = TokenObtainPairSerializer.get_token(user)
        return Response({
            "message": "Votre compte est déjà actif.",
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

        if action == "inscription":
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






