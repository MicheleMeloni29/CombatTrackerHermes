from django.contrib import admin

from .models import CombatSave


@admin.register(CombatSave)
class CombatSaveAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "is_active", "updated_at", "last_autosaved_at")
    list_filter = ("is_active", "updated_at")
    search_fields = ("name", "user__username")

# Register your models here.
