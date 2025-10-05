from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    TaskViewSet,
    CommentViewSet,
    ActivityLogViewSet,
    ProjectTaskViewSet,
    RegisterView,
    MeView,
    AdminUsersView,
    AdminProjectsView,
    AdminTasksView,
    UserCRUDView,
    ProjectCRUDView,
    TaskCRUDView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

# DRF Router pour les ViewSets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'logs', ActivityLogViewSet, basename='log')

# Router pour les tâches d'un projet spécifique
project_router = DefaultRouter()
project_router.register(r'tasks', ProjectTaskViewSet, basename='project-task')

urlpatterns = [
    # Authentification
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),

    # Administration - Utilisation des vues CRUD pour toutes les opérations
    path('admin/users/', UserCRUDView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', UserCRUDView.as_view(), name='user-crud-detail'),
    path('admin/projects/', ProjectCRUDView.as_view(), name='admin-projects-crud'),
    path('admin/projects/<int:project_id>/', ProjectCRUDView.as_view(), name='project-crud-detail'),
    path('admin/tasks/', TaskCRUDView.as_view(), name='admin-tasks'),
    path('admin/tasks/<int:task_id>/', TaskCRUDView.as_view(), name='task-crud-detail'),

    # Routes des ViewSets
    path('', include(router.urls)),
    
    # Routes pour les tâches d'un projet spécifique
    path('projects/<int:project_pk>/', include(project_router.urls)),
]