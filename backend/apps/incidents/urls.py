from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Register specific sub-resources first so they don't get captured by the
# incidents detail route (which uses the empty prefix ''). If the empty
# prefix is registered first, a path like /incidents/types/ is interpreted
# as /incidents/<pk>/ with pk='types' and captures the request.
router.register(r'types', views.IncidentTypeViewSet)
router.register(r'statuses', views.IncidentStatusViewSet)
router.register(r'', views.IncidentViewSet, basename='incident')

urlpatterns = [
    path('', include(router.urls)),
]