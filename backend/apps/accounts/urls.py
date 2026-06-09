from django.urls import path

from .views import csrf_token_view, SessionLoginView, SessionLogoutView, SessionUserView


urlpatterns = [
    path("csrf/", csrf_token_view, name="auth-csrf"),
    path("login/", SessionLoginView.as_view(), name="auth-login"),
    path("logout/", SessionLogoutView.as_view(), name="auth-logout"),
    path("me/", SessionUserView.as_view(), name="auth-me"),
]
