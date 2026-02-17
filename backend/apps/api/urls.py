from django.urls import path, include
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    # Include users app endpoints under /api/users/
    path('users/', include('apps.users.urls')),
    #path('incidents/', include('apps.incidents.urls')),
]
