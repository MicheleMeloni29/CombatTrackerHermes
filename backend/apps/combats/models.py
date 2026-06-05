import uuid

from django.conf import settings
from django.db import models


class CombatSave(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="combat_saves",
    )
    name = models.CharField(max_length=60)
    snapshot = models.JSONField(default=dict)
    is_active = models.BooleanField(default=False)
    last_autosaved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_combat_save_name_per_user",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.user.username} :: {self.name}"

# Create your models here.
