from django.db import transaction

from .models import CombatSave


def set_active_save(save: CombatSave) -> CombatSave:
    with transaction.atomic():
        CombatSave.objects.filter(user=save.user, is_active=True).exclude(pk=save.pk).update(
            is_active=False
        )
        if not save.is_active:
            save.is_active = True
            save.save(update_fields=["is_active", "updated_at"])

    return save
