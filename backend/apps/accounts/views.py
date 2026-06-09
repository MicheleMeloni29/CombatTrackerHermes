from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.middleware import csrf
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, SignupSerializer


User = get_user_model()


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    return Response({"csrfToken": csrf.get_token(request)})


class SessionLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Credenziali non valide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        return Response({"authenticated": True, "user": serialize_user(user)})


class SessionSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User.objects.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data.get("email", "").strip(),
            password=serializer.validated_data["password"],
        )
        login(request, user)

        return Response(
            {"authenticated": True, "user": serialize_user(user)},
            status=status.HTTP_201_CREATED,
        )


class SessionLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"authenticated": False, "user": None})

        return Response(
            {
                "authenticated": True,
                "user": serialize_user(request.user),
            }
        )

# Create your views here.
