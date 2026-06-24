import logging

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.middleware import csrf
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.csrf import csrf_failure as default_csrf_failure
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, SignupSerializer


User = get_user_model()
logger = logging.getLogger("apps.accounts")


def serialize_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }


def mask_username(value):
    normalized = (value or "").strip()

    if not normalized:
        return ""

    if len(normalized) <= 2:
        return f"{normalized[:1]}*"

    return f"{normalized[:2]}***"


def request_debug_context(request, *, username=""):
    user = getattr(request, "user", None)
    is_authenticated = bool(user and user.is_authenticated)

    return {
        "path": request.path,
        "method": request.method,
        "host": request.get_host(),
        "origin": request.headers.get("Origin", ""),
        "referer": request.headers.get("Referer", ""),
        "remote_addr": request.META.get("REMOTE_ADDR", ""),
        "forwarded_for": request.META.get("HTTP_X_FORWARDED_FOR", ""),
        "has_session_cookie": settings.SESSION_COOKIE_NAME in request.COOKIES,
        "has_csrf_cookie": settings.CSRF_COOKIE_NAME in request.COOKIES,
        "authenticated": is_authenticated,
        "user_id": user.id if is_authenticated else None,
        "request_user": user.username if is_authenticated else None,
        "submitted_username": mask_username(username),
    }


def csrf_failure(request, reason=""):
    context = request_debug_context(request)
    context["reason"] = reason
    logger.warning("Auth CSRF failure: %s", context)

    if request.path.startswith("/api/") or "application/json" in request.headers.get("Accept", ""):
        return JsonResponse({"detail": "Verifica CSRF non riuscita."}, status=403)

    return default_csrf_failure(request, reason=reason)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@ensure_csrf_cookie
def csrf_token_view(request):
    logger.info("Auth CSRF token requested: %s", request_debug_context(request))
    return Response({"csrfToken": csrf.get_token(request)})


class SessionLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.info(
                "Auth login validation failed: %s",
                {
                    **request_debug_context(request),
                    "errors": serializer.errors,
                },
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            logger.info(
                "Auth login rejected: %s",
                request_debug_context(
                    request,
                    username=serializer.validated_data["username"],
                ),
            )
            return Response(
                {"detail": "Credenziali non valide."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        logger.info(
            "Auth login success: %s",
            request_debug_context(
                request,
                username=serializer.validated_data["username"],
            ),
        )
        return Response({"authenticated": True, "user": serialize_user(user)})


class SessionSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        submitted_username = request.data.get("username", "")

        if not serializer.is_valid():
            logger.info(
                "Auth signup validation failed: %s",
                {
                    **request_debug_context(request, username=submitted_username),
                    "errors": serializer.errors,
                },
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=serializer.validated_data["username"],
            email=serializer.validated_data.get("email", "").strip(),
            password=serializer.validated_data["password"],
        )
        login(request, user)
        logger.info(
            "Auth signup success: %s",
            request_debug_context(
                request,
                username=serializer.validated_data["username"],
            ),
        )

        return Response(
            {"authenticated": True, "user": serialize_user(user)},
            status=status.HTTP_201_CREATED,
        )


class SessionLogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logger.info("Auth logout requested: %s", request_debug_context(request))
        logout(request)
        logger.info("Auth logout success: %s", request_debug_context(request))
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            logger.info("Auth session check unauthenticated: %s", request_debug_context(request))
            return Response({"authenticated": False, "user": None})

        logger.info("Auth session check authenticated: %s", request_debug_context(request))
        return Response(
            {
                "authenticated": True,
                "user": serialize_user(request.user),
            }
        )

# Create your views here.
