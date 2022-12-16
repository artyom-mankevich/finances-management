import os
import sys
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS_DIR = os.path.realpath(os.path.join(BASE_DIR, "apps"))
sys.path.append(APPS_DIR)

API_URL = os.environ["API_URL"]
DOMAIN_NAME = os.environ["DOMAIN_NAME"]
API_GATEWAY_DOMAIN = os.environ["API_GATEWAY_DOMAIN"]
HOME_PAGE = os.environ["HOME_PAGE"]
NGINX_PROXY_PORT = os.environ["NGINX_PROXY_PORT"]

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ["SECRET_KEY"]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ["DEBUG"]

ALLOWED_HOSTS = ["*"]
INTERNAL_IPS = ["127.0.0.1"]

# Application definition

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "drf_yasg",
    "corsheaders",
    "rest_framework_jwt",
    "rest_framework_jwt.blacklist",
]

LOCAL_APPS = [
    "base",
    "decorations",
    "accounts",
    "crypto",
    "investments",
    "wallets",
    "news",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "corsheaders.middleware.CorsPostCsrfMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.auth.middleware.RemoteUserMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

AUTHENTICATION_BACKENDS = [
    "base.backends.CustomRemoteUserBackend",
]

UNAUTHENTICATED_USER = None
UNAUTHENTICATED_TOKEN = None

ROOT_URLCONF = "project.urls"

WSGI_APPLICATION = "project.wsgi.application"
ASGI_APPLICATION = "project.asgi.application"

# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["POSTGRES_DB"],
        "USER": os.environ["POSTGRES_USER"],
        "PASSWORD": os.environ["POSTGRES_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ["DB_PORT"],
    },
}


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Europe/Minsk"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
STATICFILES_DIRS = (os.path.join(BASE_DIR, "static"),)

if not os.path.isdir(STATIC_ROOT):
    os.makedirs(STATIC_ROOT, mode=0o755)

if not os.path.isdir(STATICFILES_DIRS[0]):
    os.makedirs(STATICFILES_DIRS[0], mode=0o755)


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [STATIC_URL],
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

# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

loggers = {
    "django": {"handlers": ["console"], "level": "DEBUG"},
    "django.server": {"handlers": ["django.server"], "level": "DEBUG", "propagate": False},
}

if DEBUG:
    loggers["finances"] = {"handlers": ["console"], "level": "INFO"}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_false": {"()": "django.utils.log.RequireDebugFalse"},
        "require_debug_true": {"()": "django.utils.log.RequireDebugTrue"},
    },
    "formatters": {
        "django.server": {"()": "django.utils.log.ServerFormatter", "format": "[{server_time}] {message}", "style": "{"}
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "filters": [],
            "class": "logging.StreamHandler",
        },
        "django.server": {"level": "INFO", "class": "logging.StreamHandler", "formatter": "django.server"},
        "django.db": {"level": "DEBUG", "filters": [], "class": "logging.StreamHandler",},
    },
    "loggers": loggers,
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.memcached.PyMemcacheCache",
        "LOCATION": f"memcached:11211",
        "TIMEOUT": 0,
        "OPTIONS": {
            "no_delay": True,
            "ignore_exc": True,
            "connect_timeout": 1,
            "timeout": 1,
        }
    }
}

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_jwt.authentication.JSONWebTokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "djangorestframework_camel_case.render.CamelCaseJSONRenderer",
        "djangorestframework_camel_case.render.CamelCaseBrowsableAPIRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "djangorestframework_camel_case.parser.CamelCaseFormParser",
        "djangorestframework_camel_case.parser.CamelCaseMultiPartParser",
        "djangorestframework_camel_case.parser.CamelCaseJSONParser",
    ),
}

SWAGGER_SETTINGS = {
   'USE_SESSION_AUTH': False
}

CORS_ALLOWED_ORIGINS = []
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True

CORS_REPLACE_HTTPS_REFERER = True

AUTH0_IDENTIFIER = os.environ["AUTH0_IDENTIFIER"]
AUTH0_DOMAIN = os.environ["AUTH0_DOMAIN"]
JWT_ALGORITHM = "RS256"

JWT_AUTH = {
    "JWT_PAYLOAD_GET_USERNAME_HANDLER":
        "accounts.utils.jwt_get_username_from_payload_handler",
    "JWT_DECODE_HANDLER":
        "accounts.utils.jwt_decode_token",
    "JWT_ALGORITHM": JWT_ALGORITHM,
    "JWT_AUDIENCE": "https://finances-be.com/",
    "JWT_ISSUER": "https://dev-16fr5mnt2b0eess4.us.auth0.com/",
    "JWT_AUTH_HEADER_PREFIX": "Bearer",
}

MARKETAUX_API_KEY = os.environ["MARKETAUX_API_KEY"]
MARKETAUX_API_URL = os.environ["MARKETAUX_API_URL"]

EXCHANGERATE_HOST = os.environ["EXCHANGERATE_HOST"]

ENCRYPTION_SALT = bytes(os.environ["ENCRYPTION_SALT"], encoding="utf-8")

INFURA_API_URL = os.environ["INFURA_API_URL"]
INFURA_API_KEY = os.environ["INFURA_API_KEY"]
INFURA_API_SECRET_KEY = os.environ["INFURA_API_SECRET_KEY"]
CHAIN_ID = os.environ["CHAIN_ID"]

ETHERSCAN_API_URL = os.environ["ETHERSCAN_API_URL"]
ETHERSCAN_API_KEY = os.environ["ETHERSCAN_API_KEY"]
