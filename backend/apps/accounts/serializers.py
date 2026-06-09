from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, trim_whitespace=False)


class SignupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(max_length=128, trim_whitespace=False)
    confirmPassword = serializers.CharField(max_length=128, trim_whitespace=False)

    def validate_username(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Lo username e' obbligatorio.")

        if User.objects.filter(username__iexact=normalized).exists():
            raise serializers.ValidationError("Questo username e' gia' in uso.")

        return normalized

    def validate(self, attrs):
        if attrs["password"] != attrs["confirmPassword"]:
            raise serializers.ValidationError(
                {"confirmPassword": "Le password non coincidono."}
            )

        user = User(
            username=attrs["username"],
            email=attrs.get("email", "").strip(),
        )
        validate_password(attrs["password"], user=user)
        return attrs
