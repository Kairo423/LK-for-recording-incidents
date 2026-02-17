from django.urls import path, include
from . import views

urlpatterns = [
    path('health/', views.health, name='health'),
    path('users/', include('apps.users.urls')),
]
