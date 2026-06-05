from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import CombatSave
from .serializers import (
    CombatSaveResponseSerializer,
    CombatSaveUpdateSerializer,
    CombatSaveWriteSerializer,
)
from .services import set_active_save

MAX_COMBAT_SAVES_PER_USER = 5


class CombatSaveViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CombatSaveResponseSerializer

    def get_queryset(self):
        return CombatSave.objects.filter(user=self.request.user).order_by("-updated_at", "-created_at")

    def get_serializer_class(self):
        if self.action == "create":
            return CombatSaveWriteSerializer
        if self.action in {"partial_update", "update"}:
            return CombatSaveUpdateSerializer
        return CombatSaveResponseSerializer

    def list(self, request, *args, **kwargs):
        serializer = CombatSaveResponseSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        serializer = CombatSaveResponseSerializer(self.get_object())
        return Response(serializer.data)

    def perform_create(self, serializer):
        if self.get_queryset().count() >= MAX_COMBAT_SAVES_PER_USER:
            raise ValidationError(
                {"detail": f"Ogni utente puo' avere al massimo {MAX_COMBAT_SAVES_PER_USER} salvataggi."}
            )

        save = CombatSave.objects.create(
            user=self.request.user,
            name=serializer.validated_data["name"],
            snapshot=serializer.validated_data["snapshot"],
            is_active=serializer.validated_data.get("activate", True),
        )
        if save.is_active:
            set_active_save(save)
        self._created_instance = save

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        response_serializer = CombatSaveResponseSerializer(self._created_instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        save = self.get_object()
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        update_fields = []

        if "name" in data:
            save.name = data["name"]
            update_fields.append("name")

        if "snapshot" in data:
            save.snapshot = data["snapshot"]
            update_fields.append("snapshot")

        if "activate" in data:
            save.is_active = data["activate"]
            update_fields.append("is_active")

        if update_fields:
            save.save(update_fields=[*update_fields, "updated_at"])

        if save.is_active:
            set_active_save(save)

        response_serializer = CombatSaveResponseSerializer(save)
        return Response(response_serializer.data)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        save = self.get_object()
        set_active_save(save)
        return Response(CombatSaveResponseSerializer(save).data)

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        save = self.get_object()
        set_active_save(save)
        return Response(CombatSaveResponseSerializer(save).data)

    @action(detail=True, methods=["post"])
    def autosave(self, request, pk=None):
        save = self.get_object()
        serializer = CombatSaveWriteSerializer(
            data={
                "name": save.name,
                "snapshot": request.data.get("snapshot"),
                "activate": True,
            }
        )
        serializer.is_valid(raise_exception=True)

        save.snapshot = serializer.validated_data["snapshot"]
        save.last_autosaved_at = timezone.now()
        save.is_active = True
        save.save(update_fields=["snapshot", "last_autosaved_at", "is_active", "updated_at"])
        set_active_save(save)

        return Response(CombatSaveResponseSerializer(save).data)

# Create your views here.
