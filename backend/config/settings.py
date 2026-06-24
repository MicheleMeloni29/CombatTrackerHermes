import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

from config.env import load_env_file


def env_bool(name: str, default: bool = False) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: list[str] | None = None) -> list[str]:
    raw_value = os.getenv(name)
    if not raw_value:
        return list(default or [])

    return [item.strip() for item in raw_value.split(",") if item.strip()]

BASE_DIR = Path(__file__).resolve().parent.parent
load_env_file(BASE_DIR / ".env")
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-local-dev-key")
DEBUG = env_bool("DJANGO_DEBUG", env_bool("DEBUG", True))

default_allowed_hosts = ["127.0.0.1", "localhost"]
render_hostname = os.getenv("RENDER_EXTERNAL_HOSTNAME")
if render_hostname:
    default_allowed_hosts.append(render_hostname)

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", default_allowed_hosts)

default_cors_origins = env_list("CORS_ALLOWED_ORIGINS", ["http://localhost:3000"])
default_csrf_origins = env_list("CSRF_TRUSTED_ORIGINS", ["http://localhost:3000"])

CORS_ALLOWED_ORIGINS = default_cors_origins
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = default_csrf_origins

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "apps.accounts",
    "apps.combats",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


def build_database_config():
    database_url = os.getenv("DATABASE_URL", "").strip()

    if not database_url:
        return dj_database_url.parse(
            f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
            conn_max_age=600,
            ssl_require=False,
        )

    # Render env vars are sometimes created with placeholder values during setup.
    # Fail with a clear message instead of surfacing an opaque parser exception.
    if database_url in {"://", "postgres://", "postgresql://"} or "://" not in database_url:
        raise ImproperlyConfigured(
            "DATABASE_URL is missing or malformed. On Render, link a PostgreSQL database "
            "or paste the full connection string into the DATABASE_URL environment variable."
        )

    return dj_database_url.parse(
        database_url,
        conn_max_age=600,
        ssl_require=not DEBUG and database_url.startswith("postgres"),
    )


DATABASES = {"default": build_database_config()}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "it-it"
TIME_ZONE = "Europe/Rome"

USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        }
    },
    "loggers": {
        "apps.accounts": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        }
    },
}

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"
CSRF_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"
CSRF_FAILURE_VIEW = "apps.accounts.views.csrf_failure"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
