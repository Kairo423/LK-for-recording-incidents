from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.IncidentViewSet, basename='incident')
router.register(r'types', views.IncidentTypeViewSet)
router.register(r'statuses', views.IncidentStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
]