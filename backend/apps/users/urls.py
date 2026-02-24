from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    # contact update (email / phone)
    path('profile/contact/', views.update_contact_view, name='update_contact'),
    path('system-settings/', views.SystemSettingsView.as_view(), name='system_settings'),
    # departments (administration)
    path('departments/', views.departments_list_view, name='departments_list'),
    path('departments/create/', views.department_create_view, name='departments_create'),
    path('departments/<int:pk>/', views.department_delete_view, name='departments_delete'),
    
    path('whoami/', views.whoami, name='whoami'),
    path('', views.users_list_view, name='users_list'),
    path('<int:pk>/', views.user_detail_view, name='user_detail'),
    path('groups/', views.user_groups_view, name='user_groups'),
    path('all-groups/', views.all_groups_view, name='all_groups'),
    path('check/', views.check_auth_view, name='check_auth'),
]