from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import CombatSave


User = get_user_model()


def make_snapshot():
    return {
        "characters": [
            {
                "id": "char-1",
                "name": "Rogar",
                "maxHp": 30,
                "currentHp": 25,
                "initiative": 15,
                "isMonster": False,
                "icon": "warrior",
                "spells": [],
                "memorizedSpells": [],
            }
        ],
        "currentTurnIndex": 0,
        "round": 1,
        "isCombatStarted": True,
        "log": [
            {
                "id": "log-1",
                "type": "combat_started",
                "timestamp": 0,
                "message": "Il combattimento e' iniziato!",
            }
        ],
    }


class CombatSaveApiTests(TestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(username="ebrez", password="strong-pass-123")
        self.other_user = User.objects.create_user(username="other", password="strong-pass-456")
        self.client.force_authenticate(self.user)

    def test_create_combat_save(self):
        response = self.client.post(
            "/api/combats/",
            {"name": "Assalto alla Cripta", "snapshot": make_snapshot(), "activate": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CombatSave.objects.filter(user=self.user).count(), 1)
        self.assertEqual(response.json()["name"], "Assalto alla Cripta")

    def test_user_only_sees_own_saves(self):
        CombatSave.objects.create(user=self.user, name="Mine", snapshot=make_snapshot())
        CombatSave.objects.create(user=self.other_user, name="Theirs", snapshot=make_snapshot())

        response = self.client.get("/api/combats/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["name"], "Mine")

    def test_cannot_create_more_than_five_saves(self):
        for index in range(5):
            CombatSave.objects.create(
                user=self.user,
                name=f"Save {index}",
                snapshot=make_snapshot(),
            )

        response = self.client.post(
            "/api/combats/",
            {"name": "Overflow", "snapshot": make_snapshot(), "activate": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_autosave_updates_existing_slot(self):
        save = CombatSave.objects.create(user=self.user, name="Boss Fight", snapshot=make_snapshot())
        snapshot = make_snapshot()
        snapshot["round"] = 3

        response = self.client.post(
            f"/api/combats/{save.id}/autosave/",
            {"snapshot": snapshot},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        save.refresh_from_db()
        self.assertEqual(save.snapshot["round"], 3)
        self.assertIsNotNone(save.last_autosaved_at)
        self.assertTrue(save.is_active)

    def test_create_combat_save_accepts_memorized_spells(self):
        snapshot = make_snapshot()
        snapshot["characters"][0]["memorizedSpells"] = [
            {
                "name": "Bless",
                "durationSeconds": 60,
                "durationValue": 1,
                "durationUnit": "minutes",
            }
        ]

        response = self.client.post(
            "/api/combats/",
            {"name": "Con Magie", "snapshot": snapshot, "activate": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["characters"][0]["memorizedSpells"][0]["name"], "Bless")

    def test_restore_marks_selected_save_as_active(self):
        first = CombatSave.objects.create(
            user=self.user,
            name="First",
            snapshot=make_snapshot(),
            is_active=True,
        )
        second = CombatSave.objects.create(
            user=self.user,
            name="Second",
            snapshot=make_snapshot(),
            is_active=False,
        )

        response = self.client.post(f"/api/combats/{second.id}/restore/", format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        first.refresh_from_db()
        second.refresh_from_db()
        self.assertFalse(first.is_active)
        self.assertTrue(second.is_active)

# Create your tests here.
