from rest_framework.routers import DefaultRouter

from .views import CombatSaveViewSet


router = DefaultRouter()
router.register("", CombatSaveViewSet, basename="combat-save")

urlpatterns = router.urls
