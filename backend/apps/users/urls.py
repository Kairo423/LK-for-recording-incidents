from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('whoami/', views.whoami, name='whoami'),
    path('', views.users_list_view, name='users_list'),
    path('<int:pk>/', views.user_detail_view, name='user_detail'),
    path('groups/', views.user_groups_view, name='user_groups'),
    path('check/', views.check_auth_view, name='check_auth'),
]