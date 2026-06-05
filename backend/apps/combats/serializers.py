from rest_framework import serializers

from .models import CombatSave


class SpellSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=120)
    durationSeconds = serializers.IntegerField(min_value=0)
    castAtElapsedSeconds = serializers.IntegerField(min_value=0)


class CharacterSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=120)
    maxHp = serializers.IntegerField(min_value=1)
    currentHp = serializers.IntegerField(min_value=0)
    initiative = serializers.IntegerField()
    isMonster = serializers.BooleanField()
    icon = serializers.CharField(max_length=80, allow_blank=True)
    spells = SpellSerializer(many=True)

    def validate(self, attrs):
        if attrs["currentHp"] > attrs["maxHp"]:
            raise serializers.ValidationError("currentHp non puo' superare maxHp.")
        return attrs


class CombatLogEventSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=100)
    type = serializers.ChoiceField(
        choices=[
            "damage",
            "heal",
            "character_added",
            "character_deleted",
            "combat_started",
            "combat_reset",
            "turn_changed",
            "round_changed",
            "spell_cast",
            "spell_expired",
        ]
    )
    timestamp = serializers.IntegerField(min_value=0)
    message = serializers.CharField(max_length=500)


class CombatSnapshotSerializer(serializers.Serializer):
    characters = CharacterSerializer(many=True)
    currentTurnIndex = serializers.IntegerField(min_value=0)
    round = serializers.IntegerField(min_value=1)
    isCombatStarted = serializers.BooleanField()
    log = CombatLogEventSerializer(many=True)

    def validate(self, attrs):
        characters = attrs["characters"]
        current_turn_index = attrs["currentTurnIndex"]

        if not characters:
            if current_turn_index != 0:
                raise serializers.ValidationError(
                    "currentTurnIndex deve essere 0 quando non ci sono personaggi."
                )
            if attrs["isCombatStarted"]:
                raise serializers.ValidationError(
                    "Il combattimento non puo' essere attivo senza personaggi."
                )
            return attrs

        if current_turn_index >= len(characters):
            raise serializers.ValidationError(
                "currentTurnIndex non puo' superare la lista dei personaggi."
            )

        return attrs


class CombatSaveWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=60, trim_whitespace=True)
    snapshot = CombatSnapshotSerializer()
    activate = serializers.BooleanField(default=True)

    def validate_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Il nome del combattimento e' obbligatorio.")
        return normalized


class CombatSaveUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=60, required=False, trim_whitespace=True)
    snapshot = CombatSnapshotSerializer(required=False)
    activate = serializers.BooleanField(required=False)

    def validate_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError("Il nome del combattimento e' obbligatorio.")
        return normalized

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Specifica almeno un campo da aggiornare.")
        return attrs


class CombatSaveResponseSerializer(serializers.ModelSerializer):
    characters = serializers.SerializerMethodField()
    currentTurnIndex = serializers.SerializerMethodField()
    round = serializers.SerializerMethodField()
    isCombatStarted = serializers.SerializerMethodField()
    log = serializers.SerializerMethodField()
    savedAt = serializers.SerializerMethodField()

    class Meta:
        model = CombatSave
        fields = [
            "id",
            "name",
            "savedAt",
            "characters",
            "currentTurnIndex",
            "round",
            "isCombatStarted",
            "log",
            "is_active",
            "created_at",
            "updated_at",
            "last_autosaved_at",
        ]

    def _snapshot(self, obj: CombatSave) -> dict:
        return obj.snapshot or {}

    def get_characters(self, obj: CombatSave):
        return self._snapshot(obj).get("characters", [])

    def get_currentTurnIndex(self, obj: CombatSave):
        return self._snapshot(obj).get("currentTurnIndex", 0)

    def get_round(self, obj: CombatSave):
        return self._snapshot(obj).get("round", 1)

    def get_isCombatStarted(self, obj: CombatSave):
        return self._snapshot(obj).get("isCombatStarted", False)

    def get_log(self, obj: CombatSave):
        return self._snapshot(obj).get("log", [])

    def get_savedAt(self, obj: CombatSave):
        source = obj.last_autosaved_at or obj.updated_at
        return int(source.timestamp() * 1000)
