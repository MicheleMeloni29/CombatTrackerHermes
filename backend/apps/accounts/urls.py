from django.urls import path

from .views import (
    csrf_token_view,
    SessionLoginView,
    SessionLogoutView,
    SessionSignupView,
    SessionUserView,
)


urlpatterns = [
    path("csrf/", csrf_token_view, name="auth-csrf"),
    path("login/", SessionLoginView.as_view(), name="auth-login"),
    path("signup/", SessionSignupView.as_view(), name="auth-signup"),
    path("logout/", SessionLogoutView.as_view(), name="auth-logout"),
    path("me/", SessionUserView.as_view(), name="auth-me"),
]
