from django.contrib.auth import get_user_model
from django.test import TestCase
from django.test.utils import override_settings
from rest_framework import status
from rest_framework.test import APIClient


User = get_user_model()


@override_settings(ALLOWED_HOSTS=["testserver", "localhost", "127.0.0.1"])
class SessionAuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username="Ebrez",
            email="ebrez@example.com",
            password="CDS71Strong!",
        )

    def test_me_returns_anonymous_payload_when_logged_out(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"authenticated": False, "user": None})

    def test_csrf_endpoint_returns_token(self):
        response = self.client.get("/api/auth/csrf/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrfToken", response.json())

    def test_login_returns_authenticated_user(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "Ebrez", "password": "CDS71Strong!"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["authenticated"])
        self.assertEqual(response.json()["user"]["username"], "Ebrez")

    def test_login_rejects_invalid_credentials(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "Ebrez", "password": "wrong"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_clears_session(self):
        self.client.force_authenticate(self.user)

        response = self.client.post("/api/auth/logout/", format="json")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_signup_creates_user_and_logs_in(self):
        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": "NuovoMaster",
                "email": "nuovo@example.com",
                "password": "CDS71Strong!x",
                "confirmPassword": "CDS71Strong!x",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.json()["authenticated"])
        self.assertEqual(response.json()["user"]["username"], "NuovoMaster")
        self.assertTrue(User.objects.filter(username="NuovoMaster").exists())

    def test_signup_rejects_duplicate_username(self):
        response = self.client.post(
            "/api/auth/signup/",
            {
                "username": "Ebrez",
                "email": "altro@example.com",
                "password": "CDS71Strong!x",
                "confirmPassword": "CDS71Strong!x",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

# Create your tests here.
