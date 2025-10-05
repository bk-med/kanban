"""
================================================================================
API KANBAN - VUES PRINCIPALES - DOCUMENTATION COMPLÈTE
================================================================================

Ce fichier contient toutes les vues (views) de l'API Kanban organisées par 
fonctionnalité. Chaque vue est documentée avec des explications détaillées
de son fonctionnement, paramètres et mécanismes internes.

================================================================================
ARCHITECTURE GÉNÉRALE
================================================================================

1. VUES D'AUTHENTIFICATION
   - RegisterView: Inscription des nouveaux utilisateurs avec validation
   - MeView: Récupération des informations de l'utilisateur connecté

2. VUES DE GESTION DES PROJETS
   - ProjectViewSet: CRUD complet des projets avec gestion des membres et statistiques
     * Actions personnalisées: add_member, remove_member, stats
     * Permissions: IsProjectOwner, IsProjectMember

3. VUES DE GESTION DES TÂCHES
   - TaskViewSet: CRUD complet des tâches avec commentaires et logs
     * Actions personnalisées: logs, comment, comments
   - ProjectTaskViewSet: Gestion des tâches dans un projet spécifique
     * Création automatique de logs et notifications

4. VUES DE SUPPORT
   - CommentViewSet: Gestion des commentaires sur les tâches
   - ActivityLogViewSet: Consultation des logs d'activité (lecture seule)

================================================================================
MÉCANISMES DE SÉCURITÉ
================================================================================

- Permissions personnalisées (IsProjectMember, IsProjectOwner)
- Filtrage automatique des données selon les permissions utilisateur
- Validation des données via les serializers
- Protection contre l'accès non autorisé aux ressources

================================================================================
FLUX DE DONNÉES
================================================================================

1. Requête HTTP → Vue → Permissions → Serializer → Modèle → Base de données
2. Réponse : Base de données → Modèle → Serializer → Vue → JSON → Client

================================================================================
"""

# =============================================================================
# IMPORTS - EXPLICATION DÉTAILLÉE
# =============================================================================

# -----------------------------------------------------------------------------
# IMPORTS DJANGO CORE
# -----------------------------------------------------------------------------

# django.shortcuts : Utilitaires pour les vues Django
from django.shortcuts import render, get_object_or_404
# - render: Rend un template HTML avec un contexte
# - get_object_or_404: Récupère un objet ou lève une exception 404 si non trouvé

# django.db.models : Fonctions d'agrégation et requêtes complexes
from django.db.models import Count, Q
# - Count: Compte le nombre d'objets (ex: Count('id') pour compter les tâches)
# - Q: Permet de construire des requêtes complexes avec OR/AND (ex: Q(owner=user) | Q(members=user))

# django.contrib.auth : Gestion de l'authentification Django
from django.contrib.auth import get_user_model
# - get_user_model: Récupère le modèle User personnalisé ou par défaut

# datetime : Gestion des dates et heures
from datetime import datetime, timedelta
# - datetime: Pour les timestamps et comparaisons de dates
# - timedelta: Pour les calculs de durée (ex: +7 jours)

# -----------------------------------------------------------------------------
# IMPORTS DJANGO REST FRAMEWORK
# -----------------------------------------------------------------------------

# rest_framework : Classes de base pour les API REST
from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
# - viewsets: Classes de base pour les ViewSets (CRUD automatique)
# - status: Codes de statut HTTP (200, 201, 400, 404, etc.)
# - generics: Vues génériques pour des opérations simples (CreateAPIView, RetrieveAPIView)
# - APIView: Classe de base pour créer des vues API personnalisées

# rest_framework.decorators : Décorateurs pour personnaliser les vues
from rest_framework.decorators import action
# - action: Décorateur pour ajouter des actions personnalisées aux ViewSets

# rest_framework.permissions : Classes de permissions
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
# - AllowAny: Permet l'accès à tous (authentifiés ou non)
# - IsAuthenticated: Exige que l'utilisateur soit connecté
# - IsAdminUser: Exige que l'utilisateur soit un administrateur

# rest_framework.response : Classes de réponse
from rest_framework.response import Response
# - Response: Classe pour retourner des réponses JSON structurées

# -----------------------------------------------------------------------------
# IMPORTS LOCAUX (MODULES DE L'APPLICATION)
# -----------------------------------------------------------------------------

# .models : Modèles de données de l'application
from .models import Project, Task, Comment, ActivityLog
from django.contrib.auth.models import User
# - Project: Modèle représentant un projet Kanban
# - Task: Modèle représentant une tâche dans un projet
# - Comment: Modèle pour les commentaires sur les tâches
# - ActivityLog: Modèle pour l'historique des actions sur les tâches

# .serializers : Classes de sérialisation pour convertir les modèles en JSON
from .serializers import (
    UserSerializer, RegisterSerializer, ProjectSerializer,
    TaskSerializer, CommentSerializer, ActivityLogSerializer, ProjectTaskSerializer
)
# - UserSerializer: Sérialise les données utilisateur
# - RegisterSerializer: Sérialise les données d'inscription
# - ProjectSerializer: Sérialise les données de projet
# - TaskSerializer: Sérialise les données de tâche
# - CommentSerializer: Sérialise les commentaires
# - ActivityLogSerializer: Sérialise les logs d'activité
# - ProjectTaskSerializer: Sérialise les tâches dans le contexte d'un projet

# .filters : Classes de filtrage pour les requêtes
from .filters import TaskFilter
# - TaskFilter: Permet de filtrer les tâches par statut, priorité, assigné, etc.

# .permissions : Permissions personnalisées
from .permissions import IsProjectMember, IsProjectOwner, IsAdminOrProjectMember, IsAdminOrOwner
# - IsProjectMember: Vérifie si l'utilisateur est membre du projet
# - IsProjectOwner: Vérifie si l'utilisateur est propriétaire du projet

# -----------------------------------------------------------------------------
# CONFIGURATION GLOBALE
# -----------------------------------------------------------------------------

# Récupération du modèle User (personnalisé ou par défaut)
User = get_user_model()
# Cette variable permet d'utiliser le bon modèle User dans tout le fichier

# =============================================================================
# VUES D'AUTHENTIFICATION - DOCUMENTATION DÉTAILLÉE
# =============================================================================

class RegisterView(generics.CreateAPIView):
    """
    ========================================================================
    VUE D'INSCRIPTION DES UTILISATEURS
    ========================================================================
    
    Cette vue permet aux nouveaux utilisateurs de créer un compte dans l'application.
    Elle hérite de CreateAPIView qui fournit automatiquement la méthode POST.
    
    FONCTIONNEMENT :
    1. L'utilisateur envoie une requête POST avec ses données d'inscription
    2. Le RegisterSerializer valide les données (email, mot de passe, etc.)
    3. Si valide, un nouvel utilisateur est créé en base de données
    4. Une réponse JSON est retournée avec les détails de l'utilisateur créé
    
    PARAMÈTRES DE CLASSE :
    - permission_classes = (AllowAny,) : Permet l'accès sans authentification
    - serializer_class = RegisterSerializer : Utilise le serializer d'inscription
    
    ENDPOINT : POST /api/register/
    
    DONNÉES REQUISES (JSON) :
    {
        "username": "nom_utilisateur",
        "email": "email@example.com", 
        "password": "mot_de_passe",
        "password_confirm": "mot_de_passe"
    }
    
    RÉPONSE SUCCÈS (201) :
    {
        "id": 1,
        "username": "nom_utilisateur",
        "email": "email@example.com",
        "date_joined": "2024-01-01T00:00:00Z"
    }
    
    RÉPONSE ERREUR (400) :
    {
        "username": ["Ce champ est requis."],
        "email": ["Entrez une adresse email valide."],
        "password": ["Ce mot de passe est trop court."]
    }
    """
    # Permissions : Permet l'accès à tous (même non authentifiés)
    permission_classes = (AllowAny,)
    
    # Serializer utilisé pour valider et créer l'utilisateur
    serializer_class = RegisterSerializer


class MeView(generics.RetrieveAPIView):
    """
    ========================================================================
    VUE DE RÉCUPÉRATION DU PROFIL UTILISATEUR
    ========================================================================
    
    Cette vue permet à un utilisateur authentifié de récupérer ses propres
    informations de profil. Elle hérite de RetrieveAPIView qui fournit
    automatiquement la méthode GET.
    
    FONCTIONNEMENT :
    1. L'utilisateur doit être authentifié (token JWT ou session)
    2. La vue récupère automatiquement l'utilisateur connecté via request.user
    3. Les données sont sérialisées avec UserSerializer
    4. Une réponse JSON est retournée avec les détails du profil
    
    PARAMÈTRES DE CLASSE :
    - permission_classes = [IsAuthenticated] : Exige une authentification
    - serializer_class = UserSerializer : Utilise le serializer utilisateur
    
    MÉTHODE PERSONNALISÉE :
    - get_object() : Retourne l'utilisateur connecté (request.user)
    
    ENDPOINT : GET /api/me/
    
    HEADERS REQUIS :
    {
        "Authorization": "Bearer <token_jwt>"
    }
    
    RÉPONSE SUCCÈS (200) :
    {
        "id": 1,
        "username": "nom_utilisateur",
        "email": "email@example.com",
        "first_name": "Prénom",
        "last_name": "Nom",
        "date_joined": "2024-01-01T00:00:00Z",
        "is_active": true
    }
    
    RÉPONSE ERREUR (401) :
    {
        "detail": "Informations d'authentification non fournies."
    }
    """
    # Serializer utilisé pour formater les données utilisateur
    serializer_class = UserSerializer
    
    # Permissions : Exige que l'utilisateur soit authentifié
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """
        ====================================================================
        MÉTHODE DE RÉCUPÉRATION DE L'OBJET UTILISATEUR
        ====================================================================
        
        Cette méthode personnalise le comportement de RetrieveAPIView.
        Au lieu de récupérer un objet par ID, elle retourne directement
        l'utilisateur connecté.
        
        RETOUR :
        - self.request.user : L'utilisateur actuellement authentifié
        
        MÉCANISME :
        1. Django REST Framework appelle automatiquement cette méthode
        2. request.user est automatiquement rempli par le système d'authentification
        3. L'objet utilisateur est passé au serializer pour la sérialisation
        
        SÉCURITÉ :
        - L'utilisateur ne peut accéder qu'à ses propres données
        - Impossible de récupérer les données d'un autre utilisateur
        """
        return self.request.user


# =============================================================================
# VUES DE GESTION DES PROJETS - DOCUMENTATION DÉTAILLÉE
# =============================================================================

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ========================================================================
    VIEWSET DE GESTION COMPLÈTE DES PROJETS
    ========================================================================
    
    Cette classe hérite de ModelViewSet et fournit automatiquement toutes
    les opérations CRUD (Create, Read, Update, Delete) pour les projets.
    
    FONCTIONNALITÉS PRINCIPALES :
    - CRUD complet des projets (création, lecture, modification, suppression)
    - Gestion des membres d'un projet (ajout/suppression)
    - Consultation des statistiques détaillées d'un projet
    - Filtrage automatique selon les permissions utilisateur
    
    ACTIONS PERSONNALISÉES :
    - add_member: Ajouter un membre au projet (propriétaire seulement)
    - remove_member: Retirer un membre du projet (propriétaire seulement)
    - stats: Obtenir les statistiques détaillées du projet
    
    ENDPOINTS AUTOMATIQUES :
    - GET /api/projects/ : Liste tous les projets accessibles
    - POST /api/projects/ : Crée un nouveau projet
    - GET /api/projects/{id}/ : Récupère un projet spécifique
    - PUT /api/projects/{id}/ : Met à jour un projet complet
    - PATCH /api/projects/{id}/ : Met à jour partiellement un projet
    - DELETE /api/projects/{id}/ : Supprime un projet
    
    ENDPOINTS PERSONNALISÉS :
    - POST /api/projects/{id}/add_member/ : Ajoute un membre
    - POST /api/projects/{id}/remove_member/ : Retire un membre
    - GET /api/projects/{id}/stats/ : Statistiques du projet
    
    SÉCURITÉ :
    - Seuls les propriétaires et membres peuvent voir les projets
    - Seuls les propriétaires peuvent modifier/supprimer les projets
    - Seuls les propriétaires peuvent gérer les membres
    """
    # Serializer utilisé pour la sérialisation des projets
    serializer_class = ProjectSerializer
    
    # Queryset de base (filtré par get_queryset())
    queryset = Project.objects.all()
    
    # Permissions : Admins peuvent tout faire, autres utilisateurs selon les règles de projet
    permission_classes = [IsAdminOrProjectMember]

    def get_queryset(self):
        """
        ====================================================================
        MÉTHODE DE FILTRAGE DES PROJETS
        ====================================================================
        
        Cette méthode personnalise le queryset pour ne retourner que les
        projets auxquels l'utilisateur connecté a accès.
        
        LOGIQUE DE FILTRAGE :
        - Les administrateurs peuvent voir tous les projets
        - Les autres utilisateurs peuvent voir les projets dont ils sont propriétaire (owner)
        - Les autres utilisateurs peuvent voir les projets dont ils sont membre (members)
        - Utilise l'opérateur Q pour créer une requête OR
        - .distinct() évite les doublons si l'utilisateur est à la fois propriétaire et membre
        
        REQUÊTE SQL GÉNÉRÉE :
        - Pour les admins : SELECT * FROM projects
        - Pour les autres : SELECT DISTINCT * FROM projects 
          WHERE owner_id = user_id OR id IN (
              SELECT project_id FROM project_members WHERE user_id = user_id
          )
        
        RETOUR :
        - QuerySet filtré des projets accessibles à l'utilisateur
        
        SÉCURITÉ :
        - Les admins ont accès à tous les projets
        - Les autres utilisateurs ne voient que leurs projets
        - Appliqué automatiquement à toutes les opérations (list, retrieve, update, delete)
        """
        # Les administrateurs peuvent voir tous les projets
        if self.request.user.is_staff:
            return Project.objects.all()
        
        # Les autres utilisateurs ne voient que leurs projets
        return Project.objects.filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        """
        ====================================================================
        MÉTHODE DE CRÉATION DE PROJET
        ====================================================================
        
        Cette méthode personnalise la création d'un projet en :
        1. Définissant automatiquement le créateur comme propriétaire
        2. Ajoutant le créateur comme membre du projet
        
        FONCTIONNEMENT :
        1. Le serializer valide les données du projet
        2. serializer.save(owner=...) crée le projet avec le propriétaire
        3. project.members.add(...) ajoute le créateur aux membres
        
        PARAMÈTRES :
        - serializer : Instance du ProjectSerializer avec les données validées
        
        DONNÉES AUTOMATIQUES :
        - owner : Défini automatiquement comme l'utilisateur connecté
        - members : Le créateur est automatiquement ajouté comme membre
        
        EXEMPLE DE DONNÉES ENTRANTES :
        {
            "name": "Mon Projet",
            "description": "Description du projet"
        }
        
        RÉSULTAT :
        - Projet créé avec owner = utilisateur connecté
        - Utilisateur connecté ajouté automatiquement aux membres
        """
        # Crée le projet et définit le créateur comme propriétaire
        project = serializer.save(owner=self.request.user)
        
        # Ajoute automatiquement le créateur comme membre du projet
        project.members.add(self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsProjectOwner])
    def add_member(self, request, pk=None):
        """
        ====================================================================
        ACTION : AJOUTER UN MEMBRE AU PROJET
        ====================================================================
        
        Cette action personnalisée permet au propriétaire d'un projet d'ajouter
        un utilisateur comme membre du projet.
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique (pas sur la collection)
        - methods=['post'] : Accepte uniquement les requêtes POST
        - permission_classes=[IsProjectOwner] : Seul le propriétaire peut exécuter cette action
        
        PARAMÈTRES :
        - request : Objet de requête HTTP contenant les données
        - pk : ID du projet (récupéré depuis l'URL)
        
        DONNÉES REQUISES (JSON) :
        {
            "user_id": 123
        }
        
        FONCTIONNEMENT :
        1. Récupère le projet via get_object() (avec filtrage de sécurité)
        2. Récupère l'utilisateur à ajouter via user_id
        3. Ajoute l'utilisateur aux membres du projet
        4. Retourne une confirmation
        
        ENDPOINT : POST /api/projects/{id}/add_member/
        
        RÉPONSE SUCCÈS (200) :
        {
            "status": "member added"
        }
        
        RÉPONSE ERREUR (404) :
        - Si le projet n'existe pas ou n'est pas accessible
        - Si l'utilisateur à ajouter n'existe pas
        
        RÉPONSE ERREUR (403) :
        - Si l'utilisateur n'est pas propriétaire du projet
        """
        # Récupère le projet (avec vérification des permissions)
        project = self.get_object()
        
        # Récupère l'utilisateur à ajouter (lève 404 si non trouvé)
        user = get_object_or_404(User, pk=request.data.get('user_id'))
        
        # Ajoute l'utilisateur aux membres du projet
        project.members.add(user)
        
        # Retourne une confirmation
        return Response({'status': 'member added'})

    @action(detail=True, methods=['post'], permission_classes=[IsProjectOwner])
    def remove_member(self, request, pk=None):
        """
        ====================================================================
        ACTION : RETIRER UN MEMBRE DU PROJET
        ====================================================================
        
        Cette action personnalisée permet au propriétaire d'un projet de retirer
        un utilisateur des membres du projet.
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique
        - methods=['post'] : Accepte uniquement les requêtes POST
        - permission_classes=[IsProjectOwner] : Seul le propriétaire peut exécuter cette action
        
        PARAMÈTRES :
        - request : Objet de requête HTTP contenant les données
        - pk : ID du projet (récupéré depuis l'URL)
        
        DONNÉES REQUISES (JSON) :
        {
            "user_id": 123
        }
        
        FONCTIONNEMENT :
        1. Récupère le projet via get_object() (avec filtrage de sécurité)
        2. Récupère l'utilisateur à retirer via user_id
        3. Retire l'utilisateur des membres du projet
        4. Retourne une confirmation
        
        ENDPOINT : POST /api/projects/{id}/remove_member/
        
        RÉPONSE SUCCÈS (200) :
        {
            "status": "member removed"
        }
        
        RÉPONSE ERREUR (404) :
        - Si le projet n'existe pas ou n'est pas accessible
        - Si l'utilisateur à retirer n'existe pas
        
        RÉPONSE ERREUR (403) :
        - Si l'utilisateur n'est pas propriétaire du projet
        
        NOTE : Le propriétaire peut se retirer lui-même, mais cela peut causer
        des problèmes d'accès au projet.
        """
        # Récupère le projet (avec vérification des permissions)
        project = self.get_object()
        
        # Récupère l'utilisateur à retirer (lève 404 si non trouvé)
        user = get_object_or_404(User, pk=request.data.get('user_id'))
        
        # Retire l'utilisateur des membres du projet
        project.members.remove(user)
        
        # Retourne une confirmation
        return Response({'status': 'member removed'})

    @action(detail=True, methods=['get'], permission_classes=[IsProjectMember])
    def stats(self, request, pk=None):
        """
        ====================================================================
        ACTION : STATISTIQUES DÉTAILLÉES DU PROJET
        ====================================================================
        
        Cette action personnalisée calcule et retourne des statistiques
        complètes sur un projet, incluant les tâches, les échéances et
        les performances des membres.
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique (le projet)
        - methods=['get'] : Accepte uniquement les requêtes GET
        - permission_classes=[IsProjectMember] : Membres et propriétaires peuvent accéder
        
        PARAMÈTRES :
        - request : Objet de requête HTTP
        - pk : ID du projet (récupéré depuis l'URL)
        
        ENDPOINT : GET /api/projects/{id}/stats/
        
        STATISTIQUES CALCULÉES :
        1. Informations générales du projet
        2. Nombre total de tâches
        3. Répartition des tâches par statut (TO_DO, IN_PROGRESS, DONE)
        4. Tâches proches de l'échéance (dans les 7 prochains jours)
        5. Tâches en retard (échéance dépassée)
        6. Classement des membres par nombre de tâches terminées
        
        RÉPONSE SUCCÈS (200) :
        {
            "project": {
                "id": 1,
                "name": "Mon Projet",
                "description": "Description du projet",
                "created_at": "2024-01-01T00:00:00Z"
            },
            "statistics": {
                "total_tasks": 25,
                "tasks_by_status": {
                    "TO_DO": 10,
                    "IN_PROGRESS": 8,
                    "DONE": 7
                },
                "due_soon_tasks": [
                    {
                        "id": 1,
                        "title": "Tâche urgente",
                        "due_date": "2024-01-15",
                        "assigned_to__username": "john_doe"
                    }
                ],
                "overdue_tasks": [
                    {
                        "id": 2,
                        "title": "Tâche en retard",
                        "due_date": "2024-01-10",
                        "assigned_to__username": "jane_doe"
                    }
                ],
                "member_ranking": [
                    {
                        "assigned_to__username": "john_doe",
                        "completed_tasks": 5
                    },
                    {
                        "assigned_to__username": "jane_doe",
                        "completed_tasks": 2
                    }
                ]
            }
        }
        """
        # Récupère le projet (avec vérification des permissions)
        project = self.get_object()
        
        # ====================================================================
        # CALCUL DES STATISTIQUES GÉNÉRALES
        # ====================================================================
        
        # Récupère toutes les tâches du projet
        tasks = project.tasks.all()
        
        # Compte le nombre total de tâches
        total_tasks = tasks.count()
        
        # ====================================================================
        # RÉPARTITION PAR STATUT
        # ====================================================================
        
        # Utilise l'agrégation Django pour compter les tâches par statut
        # Génère une requête SQL : SELECT status, COUNT(id) FROM tasks GROUP BY status
        tasks_by_status = tasks.values('status').annotate(count=Count('id'))
        
        # Convertit le résultat en dictionnaire pour faciliter l'utilisation
        status_stats = {item['status']: item['count'] for item in tasks_by_status}
        
        # ====================================================================
        # TÂCHES PROCHES DE L'ÉCHÉANCE
        # ====================================================================
        
        # Calcule la date limite (7 jours à partir d'aujourd'hui)
        today = datetime.now().date()
        seven_days_later = today + timedelta(days=7)
        
        # Filtre les tâches qui sont dues dans les 7 prochains jours
        # et qui ne sont pas encore terminées
        due_soon = tasks.filter(
            due_date__lte=seven_days_later,  # Échéance <= 7 jours
            due_date__gte=today,             # Échéance >= aujourd'hui
            status__in=['TO_DO', 'IN_PROGRESS']  # Pas encore terminées
        ).values('id', 'title', 'due_date', 'assigned_to__username')
        
        # ====================================================================
        # CLASSEMENT DES MEMBRES PAR PERFORMANCE
        # ====================================================================
        
        # Calcule le nombre de tâches terminées par membre
        # Utilise l'agrégation pour compter et trier par performance
        member_stats = tasks.filter(status='DONE').values('assigned_to__username').annotate(
            completed_tasks=Count('id')
        ).order_by('-completed_tasks')  # Tri décroissant (meilleur en premier)
        
        # ====================================================================
        # TÂCHES EN RETARD
        # ====================================================================
        
        # Filtre les tâches dont l'échéance est dépassée et qui ne sont pas terminées
        overdue_tasks = tasks.filter(
            due_date__lt=today,  # Échéance < aujourd'hui (en retard)
            status__in=['TO_DO', 'IN_PROGRESS']  # Pas encore terminées
        ).values('id', 'title', 'due_date', 'assigned_to__username')
        
        # ====================================================================
        # CONSTRUCTION DE LA RÉPONSE
        # ====================================================================
        
        return Response({
            'project': {
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'created_at': project.created_at,
            },
            'statistics': {
                'total_tasks': total_tasks,
                'tasks_by_status': status_stats,
                'due_soon_tasks': list(due_soon),
                'overdue_tasks': list(overdue_tasks),
                'member_ranking': list(member_stats),
            }
        })


# =============================================================================
# VUES DE GESTION DES TÂCHES - DOCUMENTATION DÉTAILLÉE
# =============================================================================

class TaskViewSet(viewsets.ModelViewSet):
    """
    ========================================================================
    VIEWSET DE GESTION COMPLÈTE DES TÂCHES
    ========================================================================
    
    Cette classe hérite de ModelViewSet et fournit toutes les opérations CRUD
    pour les tâches, avec des fonctionnalités avancées de filtrage, recherche
    et gestion des commentaires.
    
    FONCTIONNALITÉS PRINCIPALES :
    - CRUD complet des tâches (création, lecture, modification, suppression)
    - Filtrage avancé par statut, priorité, assigné, etc.
    - Recherche textuelle dans le titre et la description
    - Tri par date d'échéance, priorité, date de création
    - Gestion des commentaires et logs d'activité
    
    ACTIONS PERSONNALISÉES :
    - logs: Consulter l'historique des activités d'une tâche
    - comment: Ajouter un commentaire à une tâche
    - comments: Lister tous les commentaires d'une tâche
    
    ENDPOINTS AUTOMATIQUES :
    - GET /api/tasks/ : Liste toutes les tâches accessibles (avec filtres)
    - POST /api/tasks/ : Crée une nouvelle tâche
    - GET /api/tasks/{id}/ : Récupère une tâche spécifique
    - PUT /api/tasks/{id}/ : Met à jour une tâche complète
    - PATCH /api/tasks/{id}/ : Met à jour partiellement une tâche
    - DELETE /api/tasks/{id}/ : Supprime une tâche
    
    ENDPOINTS PERSONNALISÉS :
    - GET /api/tasks/{id}/logs/ : Historique des activités
    - POST /api/tasks/{id}/comment/ : Ajouter un commentaire
    - GET /api/tasks/{id}/comments/ : Lister les commentaires
    
    FONCTIONNALITÉS DE FILTRAGE :
    - ?status=TO_DO : Filtrer par statut
    - ?priority=HIGH : Filtrer par priorité
    - ?assigned_to=123 : Filtrer par utilisateur assigné
    - ?project=456 : Filtrer par projet
    - ?search=terme : Recherche textuelle
    - ?ordering=-due_date : Tri par échéance (décroissant)
    
    SÉCURITÉ :
    - Seuls les membres des projets peuvent voir les tâches
    - Filtrage automatique selon les permissions utilisateur
    """
    # Serializer utilisé pour la sérialisation des tâches
    serializer_class = TaskSerializer
    
    # Queryset de base (filtré par get_queryset())
    queryset = Task.objects.all()
    
    # Classe de filtrage personnalisée
    filterset_class = TaskFilter
    
    # Champs sur lesquels la recherche textuelle est possible
    search_fields = ['title', 'description']
    
    # Champs sur lesquels le tri est possible
    ordering_fields = ['due_date', 'priority', 'created_at']
    
    # Permissions : Admins peuvent tout faire, autres utilisateurs selon les règles de projet
    permission_classes = [IsAdminOrProjectMember]

    def get_queryset(self):
        """
        ====================================================================
        MÉTHODE DE FILTRAGE DES TÂCHES
        ====================================================================
        
        Cette méthode personnalise le queryset pour ne retourner que les
        tâches des projets auxquels l'utilisateur connecté a accès.
        
        LOGIQUE DE FILTRAGE :
        - L'utilisateur peut voir les tâches des projets dont il est membre
        - L'utilisateur peut voir les tâches des projets dont il est propriétaire
        - Utilise l'opérateur Q pour créer une requête OR
        - .distinct() évite les doublons
        
        REQUÊTE SQL GÉNÉRÉE :
        SELECT DISTINCT * FROM tasks 
        WHERE project_id IN (
            SELECT id FROM projects 
            WHERE owner_id = user_id OR id IN (
                SELECT project_id FROM project_members WHERE user_id = user_id
            )
        )
        
        RETOUR :
        - QuerySet filtré des tâches accessibles à l'utilisateur
        
        SÉCURITÉ :
        - Empêche l'accès aux tâches des projets non autorisés
        - Appliqué automatiquement à toutes les opérations CRUD
        """
        # Récupère le queryset de base (avec filtres et recherche appliqués)
        qs = super().get_queryset()
        
        # Les administrateurs peuvent voir toutes les tâches
        if self.request.user.is_staff:
            return qs
        
        # Les autres utilisateurs ne voient que les tâches de leurs projets
        return qs.filter(
            Q(project__members=self.request.user) | Q(project__owner=self.request.user)
        ).distinct()

    @action(detail=True, methods=['get'], permission_classes=[IsProjectMember])
    def logs(self, request, pk=None):
        """
        ====================================================================
        ACTION : HISTORIQUE DES ACTIVITÉS D'UNE TÂCHE
        ====================================================================
        
        Cette action personnalisée retourne l'historique complet des activités
        (logs) d'une tâche spécifique.
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique (la tâche)
        - methods=['get'] : Accepte uniquement les requêtes GET
        - permission_classes=[IsProjectMember] : Membres et propriétaires peuvent accéder
        
        PARAMÈTRES :
        - request : Objet de requête HTTP
        - pk : ID de la tâche (récupéré depuis l'URL)
        
        ENDPOINT : GET /api/tasks/{id}/logs/
        
        FONCTIONNEMENT :
        1. Récupère la tâche via get_object() (avec vérification des permissions)
        2. Accède à tous les logs de la tâche via task.logs.all()
        3. Sérialise les logs avec ActivityLogSerializer
        4. Retourne la liste des logs en JSON
        
        RÉPONSE SUCCÈS (200) :
        [
            {
                "id": 1,
                "action": "created task",
                "timestamp": "2024-01-01T10:00:00Z",
                "user": {
                    "id": 1,
                    "username": "john_doe"
                }
            },
            {
                "id": 2,
                "action": "updated status to IN_PROGRESS",
                "timestamp": "2024-01-01T11:00:00Z",
                "user": {
                    "id": 2,
                    "username": "jane_doe"
                }
            }
        ]
        
        RÉPONSE ERREUR (404) :
        - Si la tâche n'existe pas ou n'est pas accessible
        
        RÉPONSE ERREUR (403) :
        - Si l'utilisateur n'est pas membre du projet
        """
        # Récupère la tâche (avec vérification des permissions)
        task = self.get_object()
        
        # Récupère tous les logs de la tâche et les sérialise
        serializer = ActivityLogSerializer(task.logs.all(), many=True)
        
        # Retourne les logs en JSON
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsProjectMember])
    def comment(self, request, pk=None):
        """
        ====================================================================
        ACTION : AJOUTER UN COMMENTAIRE À UNE TÂCHE
        ====================================================================
        
        Cette action personnalisée permet d'ajouter un nouveau commentaire
        à une tâche spécifique.
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique (la tâche)
        - methods=['post'] : Accepte uniquement les requêtes POST
        - permission_classes=[IsProjectMember] : Membres et propriétaires peuvent accéder
        
        PARAMÈTRES :
        - request : Objet de requête HTTP contenant les données du commentaire
        - pk : ID de la tâche (récupéré depuis l'URL)
        
        DONNÉES REQUISES (JSON) :
        {
            "content": "Contenu du commentaire"
        }
        
        ENDPOINT : POST /api/tasks/{id}/comment/
        
        FONCTIONNEMENT :
        1. Récupère la tâche via get_object() (avec vérification des permissions)
        2. Prépare les données du commentaire (ajoute l'ID de la tâche)
        3. Valide les données avec CommentSerializer
        4. Si valide, sauvegarde le commentaire avec l'auteur
        5. Retourne le commentaire créé ou les erreurs de validation
        
        RÉPONSE SUCCÈS (201) :
        {
            "id": 1,
            "content": "Contenu du commentaire",
            "author": {
                "id": 1,
                "username": "john_doe"
            },
            "created_at": "2024-01-01T10:00:00Z"
        }
        
        RÉPONSE ERREUR (400) :
        {
            "content": ["Ce champ est requis."]
        }
        
        RÉPONSE ERREUR (404) :
        - Si la tâche n'existe pas ou n'est pas accessible
        
        RÉPONSE ERREUR (403) :
        - Si l'utilisateur n'est pas membre du projet
        """
        # Récupère la tâche (avec vérification des permissions)
        task = self.get_object()
        
        # Prépare les données du commentaire (ajoute l'ID de la tâche)
        comment_data = {**request.data, 'task': task.id}
        
        # Valide les données avec le serializer
        serializer = CommentSerializer(data=comment_data, context={'request': request})
        
        if serializer.is_valid():
            # Sauvegarde le commentaire avec l'auteur
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Retourne les erreurs de validation
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], permission_classes=[IsProjectMember])
    def comments(self, request, pk=None):
        """
        ====================================================================
        ACTION : LISTER TOUS LES COMMENTAIRES D'UNE TÂCHE
        ====================================================================
        
        Cette action personnalisée retourne tous les commentaires d'une tâche
        spécifique, triés par date de création (plus récents en premier).
        
        DÉCORATEUR @action :
        - detail=True : Action sur un objet spécifique (la tâche)
        - methods=['get'] : Accepte uniquement les requêtes GET
        - permission_classes=[IsProjectMember] : Membres et propriétaires peuvent accéder
        
        PARAMÈTRES :
        - request : Objet de requête HTTP
        - pk : ID de la tâche (récupéré depuis l'URL)
        
        ENDPOINT : GET /api/tasks/{id}/comments/
        
        FONCTIONNEMENT :
        1. Récupère la tâche via get_object() (avec vérification des permissions)
        2. Récupère tous les commentaires de la tâche triés par date (plus récents en premier)
        3. Sérialise les commentaires avec CommentSerializer
        4. Retourne la liste des commentaires en JSON
        
        TRI :
        - Les commentaires sont triés par date de création décroissante
        - Le plus récent commentaire apparaît en premier
        
        RÉPONSE SUCCÈS (200) :
        [
            {
                "id": 2,
                "content": "Commentaire récent",
                "author": {
                    "id": 2,
                    "username": "jane_doe"
                },
                "created_at": "2024-01-01T12:00:00Z"
            },
            {
                "id": 1,
                "content": "Premier commentaire",
                "author": {
                    "id": 1,
                    "username": "john_doe"
                },
                "created_at": "2024-01-01T10:00:00Z"
            }
        ]
        
        RÉPONSE ERREUR (404) :
        - Si la tâche n'existe pas ou n'est pas accessible
        
        RÉPONSE ERREUR (403) :
        - Si l'utilisateur n'est pas membre du projet
        """
        # Récupère la tâche (avec vérification des permissions)
        task = self.get_object()
        
        # Récupère tous les commentaires triés par date (plus récents en premier)
        comments = task.comments.all().order_by('-created_at')
        
        # Sérialise les commentaires
        serializer = CommentSerializer(comments, many=True)
        
        # Retourne les commentaires en JSON
        return Response(serializer.data)

class ProjectTaskViewSet(viewsets.ModelViewSet):
    """
    ========================================================================
    VIEWSET SPÉCIALISÉ POUR LES TÂCHES D'UN PROJET
    ========================================================================
    
    Cette classe hérite de ModelViewSet et fournit toutes les opérations CRUD
    pour les tâches dans le contexte d'un projet spécifique. Elle est utilisée
    via des URLs imbriquées (nested routes).
    
    UTILISÉ VIA L'URL : /api/projects/{project_id}/tasks/
    
    FONCTIONNALITÉS PRINCIPALES :
    - CRUD complet des tâches dans un projet spécifique
    - Filtrage avancé par statut, priorité, assigné, etc.
    - Recherche textuelle dans le titre et la description
    - Tri par date d'échéance, priorité, date de création
    - Enregistrement automatique des logs d'activité
    - Envoi automatique de notifications lors de l'assignation
    
    ENDPOINTS :
    - GET /api/projects/{project_id}/tasks/ : Liste les tâches du projet
    - POST /api/projects/{project_id}/tasks/ : Crée une tâche dans le projet
    - GET /api/projects/{project_id}/tasks/{id}/ : Récupère une tâche
    - PUT /api/projects/{project_id}/tasks/{id}/ : Met à jour une tâche
    - PATCH /api/projects/{project_id}/tasks/{id}/ : Met à jour partiellement
    - DELETE /api/projects/{project_id}/tasks/{id}/ : Supprime une tâche
    
    DIFFÉRENCES AVEC TaskViewSet :
    - Scope limité aux tâches d'un seul projet
    - Création automatique de logs d'activité
    - Envoi automatique de notifications
    - Contexte du projet toujours disponible
    
    SÉCURITÉ :
    - Seuls les membres et propriétaires du projet peuvent accéder
    - Vérification automatique de l'appartenance au projet
    - Les tâches sont automatiquement liées au projet
    
    MÉCANISMES AUTOMATIQUES :
    1. Lors de la création d'une tâche :
       - Association automatique au projet
       - Création d'un log d'activité "created task"
       - Envoi d'une notification si la tâche est assignée
    """
    # Serializer utilisé pour la sérialisation des tâches du projet
    serializer_class = ProjectTaskSerializer
    
    # Classe de filtrage personnalisée
    filterset_class = TaskFilter
    
    # Champs sur lesquels la recherche textuelle est possible
    search_fields = ['title', 'description']
    
    # Champs sur lesquels le tri est possible
    ordering_fields = ['due_date', 'priority', 'created_at']
    
    # Permissions : Admins peuvent tout faire, autres utilisateurs membres du projet
    permission_classes = [IsAdminOrProjectMember]

    def get_queryset(self):
        """
        ====================================================================
        MÉTHODE DE FILTRAGE DES TÂCHES DU PROJET
        ====================================================================
        
        Cette méthode personnalise le queryset pour ne retourner que les
        tâches du projet spécifié dans l'URL.
        
        FONCTIONNEMENT :
        1. Récupère l'ID du projet depuis les kwargs de l'URL (project_pk)
        2. Filtre les tâches pour ne garder que celles du projet
        
        PARAMÈTRES RÉCUPÉRÉS DE L'URL :
        - project_pk : ID du projet (extrait de /projects/{project_pk}/tasks/)
        
        EXEMPLE D'URL :
        - /api/projects/123/tasks/ → project_pk = 123
        
        REQUÊTE SQL GÉNÉRÉE :
        SELECT * FROM tasks WHERE project_id = {project_pk}
        
        RETOUR :
        - QuerySet filtré des tâches du projet spécifié
        
        SÉCURITÉ :
        - Les permissions IsProjectMember vérifient l'accès au projet
        - Empêche l'accès aux tâches d'autres projets
        """
        # Récupère l'ID du projet depuis l'URL
        project_id = self.kwargs.get('project_pk')
        
        # Les administrateurs peuvent voir toutes les tâches du projet
        if self.request.user.is_staff:
            return Task.objects.filter(project_id=project_id)
        
        # Les autres utilisateurs doivent être membres du projet
        # Vérifier d'abord si l'utilisateur a accès au projet
        try:
            project = Project.objects.get(id=project_id)
            if (self.request.user in project.members.all() or 
                project.owner == self.request.user):
                return Task.objects.filter(project_id=project_id)
            else:
                return Task.objects.none()  # Aucune tâche si pas membre
        except Project.DoesNotExist:
            return Task.objects.none()  # Aucune tâche si projet n'existe pas

    def get_serializer_context(self):
        """
        ====================================================================
        MÉTHODE D'AJOUT DU CONTEXTE AU SERIALIZER
        ====================================================================
        
        Cette méthode personnalise le contexte passé au serializer pour
        inclure l'ID du projet. Cela permet au serializer d'utiliser
        cette information lors de la validation et de la création.
        
        FONCTIONNEMENT :
        1. Récupère le contexte de base (request, view, format)
        2. Ajoute l'ID du projet au contexte
        3. Le serializer peut accéder à project_id via self.context['project_id']
        
        CONTEXTE AJOUTÉ :
        - project_id : ID du projet depuis l'URL
        
        UTILITÉ :
        - Permet au serializer de valider les données dans le contexte du projet
        - Facilite la création de tâches sans répéter l'ID du projet
        - Permet les validations spécifiques au projet
        
        RETOUR :
        - Dictionnaire de contexte enrichi
        """
        # Récupère le contexte de base du parent
        context = super().get_serializer_context()
        
        # Ajoute l'ID du projet au contexte
        context['project_id'] = self.kwargs.get('project_pk')
        
        return context

    def perform_create(self, serializer):
        """
        ====================================================================
        MÉTHODE DE CRÉATION DE TÂCHE AVEC LOGS ET NOTIFICATIONS
        ====================================================================
        
        Cette méthode personnalise la création d'une tâche pour :
        1. Associer automatiquement la tâche au projet
        2. Créer automatiquement un log d'activité
        3. Envoyer une notification si la tâche est assignée
        
        PARAMÈTRES :
        - serializer : Instance du ProjectTaskSerializer avec les données validées
        
        FONCTIONNEMENT :
        1. Récupère l'ID du projet depuis l'URL
        2. Récupère le projet (lève 404 si non trouvé)
        3. Crée la tâche et l'associe au projet
        4. Crée un log d'activité "created task"
        5. Si la tâche est assignée, envoie une notification
        
        DONNÉES AUTOMATIQUES :
        - project : Défini automatiquement depuis l'URL
        - Log d'activité créé avec action="created task"
        - Notification envoyée à l'utilisateur assigné (si présent)
        
        EXEMPLE DE DONNÉES ENTRANTES :
        {
            "title": "Nouvelle tâche",
            "description": "Description de la tâche",
            "status": "TO_DO",
            "priority": "HIGH",
            "assigned_to": 123,
            "due_date": "2024-01-15"
        }
        
        RÉSULTAT :
        - Tâche créée et liée au projet
        - Log d'activité créé automatiquement
        - Notification envoyée si assigned_to est défini
        
        LOG CRÉÉ :
        {
            "task": task_id,
            "user": request.user,
            "action": "created task",
            "timestamp": now()
        }
        
        NOTIFICATION :
        - Envoyée uniquement si task.assigned_to est défini
        - Fonction : send_task_assigned_notification(task, user)
        """
        # Récupère l'ID du projet depuis l'URL
        project_id = self.kwargs.get('project_pk')
        
        # Récupère le projet (lève 404 si non trouvé)
        project = get_object_or_404(Project, id=project_id)
        
        # Crée la tâche et l'associe au projet
        task = serializer.save(project=project)
        
        # Crée automatiquement un log d'activité pour la création
        ActivityLog.objects.create(
            task=task, 
            user=self.request.user, 
            action='created task'
        )
        
        # Envoie une notification si la tâche est assignée à un utilisateur
        if task.assigned_to:
            from .notifications import send_task_assigned_notification
            send_task_assigned_notification(task, task.assigned_to)


# =============================================================================
# VUES DE SUPPORT (COMMENTAIRES ET LOGS) - DOCUMENTATION DÉTAILLÉE
# =============================================================================

class CommentViewSet(viewsets.ModelViewSet):
    """
    ========================================================================
    VIEWSET DE GESTION DES COMMENTAIRES
    ========================================================================
    
    Cette classe hérite de ModelViewSet et fournit toutes les opérations CRUD
    pour les commentaires sur les tâches.
    
    FONCTIONNALITÉS PRINCIPALES :
    - CRUD complet des commentaires (création, lecture, modification, suppression)
    - Filtrage automatique selon les permissions utilisateur
    - Accès uniquement aux commentaires des projets accessibles
    
    ENDPOINTS AUTOMATIQUES :
    - GET /api/comments/ : Liste tous les commentaires accessibles
    - POST /api/comments/ : Crée un nouveau commentaire
    - GET /api/comments/{id}/ : Récupère un commentaire spécifique
    - PUT /api/comments/{id}/ : Met à jour un commentaire complet
    - PATCH /api/comments/{id}/ : Met à jour partiellement un commentaire
    - DELETE /api/comments/{id}/ : Supprime un commentaire
    
    SÉCURITÉ :
    - Les utilisateurs ne voient que les commentaires des tâches des projets
      dont ils sont propriétaires ou membres
    - Filtrage automatique via get_queryset()
    - Seul l'auteur peut modifier/supprimer ses propres commentaires
    
    NOTE :
    - Il est recommandé d'utiliser l'endpoint /api/tasks/{id}/comments/
      pour lister les commentaires d'une tâche spécifique
    - Cet endpoint global est utile pour les recherches transversales
    """
    # Serializer utilisé pour la sérialisation des commentaires
    serializer_class = CommentSerializer
    
    # Queryset de base (filtré par get_queryset())
    queryset = Comment.objects.all()
    
    # Permissions : Admins peuvent tout faire, autres utilisateurs selon les règles de projet
    permission_classes = [IsAdminOrProjectMember]

    def get_queryset(self):
        """
        ====================================================================
        MÉTHODE DE FILTRAGE DES COMMENTAIRES
        ====================================================================
        
        Cette méthode personnalise le queryset pour ne retourner que les
        commentaires des tâches des projets auxquels l'utilisateur connecté
        a accès.
        
        LOGIQUE DE FILTRAGE :
        - L'utilisateur peut voir les commentaires des tâches des projets
          dont il est membre
        - L'utilisateur peut voir les commentaires des tâches des projets
          dont il est propriétaire
        - Utilise l'opérateur Q pour créer une requête OR
        - .distinct() évite les doublons
        
        CHEMIN D'ACCÈS :
        Comment → Task → Project → (Members | Owner)
        
        REQUÊTE SQL GÉNÉRÉE :
        SELECT DISTINCT * FROM comments 
        WHERE task_id IN (
            SELECT id FROM tasks WHERE project_id IN (
                SELECT id FROM projects 
                WHERE owner_id = user_id OR id IN (
                    SELECT project_id FROM project_members WHERE user_id = user_id
                )
            )
        )
        
        RETOUR :
        - QuerySet filtré des commentaires accessibles à l'utilisateur
        
        SÉCURITÉ :
        - Empêche l'accès aux commentaires des projets non autorisés
        - Appliqué automatiquement à toutes les opérations CRUD
        - Double vérification via task → project
        """
        # Les administrateurs peuvent voir tous les commentaires
        if self.request.user.is_staff:
            return Comment.objects.all()
        
        # Les autres utilisateurs ne voient que les commentaires de leurs projets
        return Comment.objects.filter(
            Q(task__project__members=self.request.user) | 
            Q(task__project__owner=self.request.user)
        ).distinct()


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ========================================================================
    VIEWSET DE CONSULTATION DES LOGS D'ACTIVITÉ (LECTURE SEULE)
    ========================================================================
    
    Cette classe hérite de ReadOnlyModelViewSet et fournit uniquement les
    opérations de lecture pour les logs d'activité. Les logs ne peuvent
    pas être modifiés ou supprimés pour préserver l'intégrité de l'historique.
    
    FONCTIONNALITÉS PRINCIPALES :
    - Lecture seule des logs d'activité
    - Filtrage automatique selon les permissions utilisateur
    - Accès uniquement aux logs des projets accessibles
    - Consultation de l'historique complet des actions sur les tâches
    
    ENDPOINTS DISPONIBLES (LECTURE SEULE) :
    - GET /api/activity-logs/ : Liste tous les logs accessibles
    - GET /api/activity-logs/{id}/ : Récupère un log spécifique
    
    ENDPOINTS NON DISPONIBLES :
    - POST : Création interdite (les logs sont créés automatiquement)
    - PUT/PATCH : Modification interdite (préservation de l'intégrité)
    - DELETE : Suppression interdite (conservation de l'historique)
    
    SÉCURITÉ :
    - Les utilisateurs ne voient que les logs des tâches des projets
      dont ils sont propriétaires ou membres
    - Filtrage automatique via get_queryset()
    - Aucune modification possible pour garantir l'intégrité
    
    TYPES D'ACTIONS ENREGISTRÉES :
    - "created task" : Création d'une tâche
    - "updated status to {status}" : Changement de statut
    - "updated priority to {priority}" : Changement de priorité
    - "assigned task to {user}" : Assignation de tâche
    - "commented on task" : Ajout de commentaire
    - Et autres actions personnalisées
    
    NOTE :
    - Il est recommandé d'utiliser l'endpoint /api/tasks/{id}/logs/
      pour consulter les logs d'une tâche spécifique
    - Cet endpoint global est utile pour les audits et analyses transversales
    """
    # Serializer utilisé pour la sérialisation des logs
    serializer_class = ActivityLogSerializer
    
    # Queryset de base (filtré par get_queryset())
    queryset = ActivityLog.objects.all()
    
    # Permissions : Admins peuvent tout faire, autres utilisateurs selon les règles de projet
    permission_classes = [IsAdminOrProjectMember]

    def get_queryset(self):
        """
        ====================================================================
        MÉTHODE DE FILTRAGE DES LOGS D'ACTIVITÉ
        ====================================================================
        
        Cette méthode personnalise le queryset pour ne retourner que les
        logs d'activité des tâches des projets auxquels l'utilisateur
        connecté a accès.
        
        LOGIQUE DE FILTRAGE :
        - L'utilisateur peut voir les logs des tâches des projets
          dont il est membre
        - L'utilisateur peut voir les logs des tâches des projets
          dont il est propriétaire
        - Utilise l'opérateur Q pour créer une requête OR
        - .distinct() évite les doublons
        
        CHEMIN D'ACCÈS :
        ActivityLog → Task → Project → (Members | Owner)
        
        REQUÊTE SQL GÉNÉRÉE :
        SELECT DISTINCT * FROM activity_logs 
        WHERE task_id IN (
            SELECT id FROM tasks WHERE project_id IN (
                SELECT id FROM projects 
                WHERE owner_id = user_id OR id IN (
                    SELECT project_id FROM project_members WHERE user_id = user_id
                )
            )
        )
        
        RETOUR :
        - QuerySet filtré des logs accessibles à l'utilisateur
        
        SÉCURITÉ :
        - Empêche l'accès aux logs des projets non autorisés
        - Appliqué automatiquement à toutes les opérations de lecture
        - Double vérification via task → project
        - Préservation de l'intégrité de l'historique
        
        TRI RECOMMANDÉ :
        - Par défaut : Ordre chronologique (timestamp)
        - Peut être personnalisé avec ?ordering=-timestamp (plus récents en premier)
        """
        # Les administrateurs peuvent voir tous les logs
        if self.request.user.is_staff:
            return ActivityLog.objects.all()
        
        # Les autres utilisateurs ne voient que les logs de leurs projets
        return ActivityLog.objects.filter(
            Q(task__project__members=self.request.user) | 
            Q(task__project__owner=self.request.user)
        ).distinct()


# =============================================================================
# FIN DU FICHIER VIEWS.PY
# =============================================================================
"""
Ce fichier contient toutes les vues de l'API Kanban avec une documentation
complète de chaque fonction, paramètre et mécanisme.

RÉSUMÉ DES VUES :
1. RegisterView, MeView : Authentification
2. ProjectViewSet : Gestion complète des projets
3. TaskViewSet : Gestion complète des tâches (global)
4. ProjectTaskViewSet : Gestion des tâches d'un projet spécifique
5. CommentViewSet : Gestion des commentaires
6. ActivityLogViewSet : Consultation des logs (lecture seule)

MÉCANISMES CLÉS :
- Filtrage automatique selon les permissions utilisateur
- Validation des données via les serializers
- Création automatique de logs d'activité
- Envoi automatique de notifications
- Protection contre l'accès non autorisé aux ressources

SÉCURITÉ :
- Permissions personnalisées (IsProjectMember, IsProjectOwner)
- Filtrage systématique des données
- Vérification de l'authentification
- Protection des logs (lecture seule)

Pour plus d'informations, consultez :
- models.py : Définition des modèles de données
- serializers.py : Validation et sérialisation des données
- permissions.py : Permissions personnalisées
- filters.py : Filtres de recherche
- notifications.py : Système de notifications
"""

# ================================================================================
# VUES D'ADMINISTRATION
# ================================================================================

class AdminUsersView(APIView):
    """
    Vue d'administration pour récupérer tous les utilisateurs.
    
    Cette vue permet aux administrateurs de consulter la liste complète
    des utilisateurs avec leurs informations de base.
    
    URL: /api/admin/users/
    Méthodes: GET
    Permissions: IsAdminUser (seuls les administrateurs)
    
    Retourne:
    - Liste de tous les utilisateurs avec informations de base
    - Statut de chaque utilisateur (actif/inactif)
    - Informations de rôle (staff/normal)
    - Date d'inscription
    """
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Récupère la liste de tous les utilisateurs.
        
        Returns:
        - 200: Liste des utilisateurs avec succès
        - 401: Non authentifié
        - 403: Pas les permissions d'admin
        """
        try:
            # Récupérer tous les utilisateurs
            users = User.objects.all().order_by('-date_joined')
            
            # Préparer les données pour la réponse
            users_data = []
            for user in users:
                users_data.append({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'is_superuser': user.is_superuser,
                    'date_joined': user.date_joined.isoformat(),
                    'last_login': user.last_login.isoformat() if user.last_login else None,
                })
            
            return Response({
                'users': users_data,
                'total': len(users_data),
                'active_users': len([u for u in users_data if u['is_active']]),
                'staff_users': len([u for u in users_data if u['is_staff']]),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des utilisateurs',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminProjectsView(APIView):
    """
    Vue d'administration pour récupérer tous les projets.
    
    Cette vue permet aux administrateurs de consulter tous les projets
    avec leurs créateurs et statistiques.
    
    URL: /api/admin/projects/
    Méthodes: GET
    Permissions: IsAdminUser (seuls les administrateurs)
    
    Retourne:
    - Liste de tous les projets avec créateur
    - Statistiques des projets (total, actifs, complétés)
    - Informations sur les membres de chaque projet
    """
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Récupère la liste de tous les projets.
        
        Returns:
        - 200: Liste des projets avec succès
        - 401: Non authentifié
        - 500: Erreur serveur
        """
        try:
            # Récupérer tous les projets avec leurs propriétaires
            projects = Project.objects.select_related('owner').all().order_by('-created_at')
            
            # Préparer les données pour la réponse
            projects_data = []
            for project in projects:
                projects_data.append({
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'created_at': project.created_at.isoformat(),
                    'created_by': {
                        'id': project.owner.id,
                        'username': project.owner.username,
                        'email': project.owner.email,
                        'first_name': project.owner.first_name,
                        'last_name': project.owner.last_name,
                    } if project.owner else None,
                    'members_count': project.members.count(),
                    'tasks_count': project.tasks.count(),
                })
            
            return Response({
                'projects': projects_data,
                'total': len(projects_data),
                'projects_with_tasks': len([p for p in projects_data if p['tasks_count'] > 0]),
                'projects_with_members': len([p for p in projects_data if p['members_count'] > 0]),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des projets',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminTasksView(APIView):
    """
    Vue d'administration pour récupérer toutes les tâches.
    
    Cette vue permet aux administrateurs de consulter toutes les tâches
    avec leurs créateurs, projets et assignés.
    
    URL: /api/admin/tasks/
    Méthodes: GET
    Permissions: IsAdminUser (seuls les administrateurs)
    
    Retourne:
    - Liste de toutes les tâches avec créateur et assigné
    - Informations sur le projet de chaque tâche
    - Statistiques des tâches par statut
    """
    
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """
        Récupère la liste de toutes les tâches.
        
        Returns:
        - 200: Liste des tâches avec succès
        - 401: Non authentifié
        - 500: Erreur serveur
        """
        try:
            # Récupérer toutes les tâches avec leurs relations
            tasks = Task.objects.select_related('project', 'assigned_to').all().order_by('-created_at')
            
            # Préparer les données pour la réponse
            tasks_data = []
            for task in tasks:
                tasks_data.append({
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'priority': task.priority,
                    'created_at': task.created_at.isoformat(),
                    'updated_at': task.updated_at.isoformat(),
                    'due_date': task.due_date.isoformat() if task.due_date else None,
                    'project': {
                        'id': task.project.id,
                        'name': task.project.name,
                        'owner': {
                            'id': task.project.owner.id,
                            'username': task.project.owner.username,
                            'email': task.project.owner.email,
                        } if task.project.owner else None,
                    } if task.project else None,
                    'assigned_to': {
                        'id': task.assigned_to.id,
                        'username': task.assigned_to.username,
                        'email': task.assigned_to.email,
                        'first_name': task.assigned_to.first_name,
                        'last_name': task.assigned_to.last_name,
                    } if task.assigned_to else None,
                })
            
            return Response({
                'tasks': tasks_data,
                'total': len(tasks_data),
                'todo_tasks': len([t for t in tasks_data if t['status'] == 'TO_DO']),
                'in_progress_tasks': len([t for t in tasks_data if t['status'] == 'IN_PROGRESS']),
                'done_tasks': len([t for t in tasks_data if t['status'] == 'DONE']),
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des tâches',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# CRUD Views pour l'administration
class UserCRUDView(APIView):
    """Vue CRUD pour la gestion des utilisateurs"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, user_id=None):
        """Lister tous les utilisateurs ou récupérer un utilisateur spécifique"""
        try:
            if user_id:
                user = User.objects.get(id=user_id)
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'is_superuser': user.is_superuser,
                    'date_joined': user.date_joined,
                    'last_login': user.last_login
                }, status=status.HTTP_200_OK)
            else:
                users = User.objects.all()
                users_data = []
                for user in users:
                    users_data.append({
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_active': user.is_active,
                        'is_superuser': user.is_superuser,
                        'date_joined': user.date_joined,
                        'last_login': user.last_login
                    })
                return Response(users_data, status=status.HTTP_200_OK)
                
        except User.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des utilisateurs',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Créer un nouvel utilisateur"""
        try:
            data = request.data
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                is_staff=data.get('is_staff', False),
                is_active=data.get('is_active', True)
            )
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'last_login': user.last_login
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la création de l\'utilisateur',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, user_id):
        """Mettre à jour un utilisateur"""
        try:
            user = User.objects.get(id=user_id)
            data = request.data
            
            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.is_staff = data.get('is_staff', user.is_staff)
            user.is_active = data.get('is_active', user.is_active)
            
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            user.save()
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined,
                'last_login': user.last_login
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la mise à jour de l\'utilisateur',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, user_id):
        """Supprimer un utilisateur"""
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            
            return Response({
                'message': 'Utilisateur supprimé avec succès'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la suppression de l\'utilisateur',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProjectCRUDView(APIView):
    """Vue CRUD pour la gestion des projets"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, project_id=None):
        """Lister tous les projets ou récupérer un projet spécifique"""
        try:
            if project_id:
                project = Project.objects.select_related('owner').get(id=project_id)
                return Response({
                    'id': project.id,
                    'name': project.name,
                    'description': project.description,
                    'created_at': project.created_at,
                    'owner': {
                        'id': project.owner.id,
                        'username': project.owner.username,
                        'email': project.owner.email,
                        'first_name': project.owner.first_name,
                        'last_name': project.owner.last_name
                    },
                    'members_count': project.members.count(),
                    'tasks_count': project.tasks.count()
                }, status=status.HTTP_200_OK)
            else:
                projects = Project.objects.select_related('owner').all()
                projects_data = []
                for project in projects:
                    projects_data.append({
                        'id': project.id,
                        'name': project.name,
                        'description': project.description,
                        'created_at': project.created_at,
                        'owner': {
                            'id': project.owner.id,
                            'username': project.owner.username,
                            'email': project.owner.email,
                            'first_name': project.owner.first_name,
                            'last_name': project.owner.last_name
                        },
                        'members_count': project.members.count(),
                        'tasks_count': project.tasks.count()
                    })
                return Response(projects_data, status=status.HTTP_200_OK)
                
        except Project.DoesNotExist:
            return Response({
                'error': 'Projet non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des projets',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Créer un nouveau projet"""
        try:
            data = request.data
            project = Project.objects.create(
                name=data['name'],
                description=data.get('description', ''),
                owner=request.user
            )
            
            return Response({
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'created_at': project.created_at,
                'owner': {
                    'id': project.owner.id,
                    'username': project.owner.username,
                    'email': project.owner.email,
                    'first_name': project.owner.first_name,
                    'last_name': project.owner.last_name
                },
                'members_count': project.members.count(),
                'tasks_count': project.tasks.count()
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la création du projet',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, project_id):
        """Mettre à jour un projet"""

        try:
            project = Project.objects.get(id=project_id)
            data = request.data
            
            project.name = data.get('name', project.name)
            project.description = data.get('description', project.description)
            project.save()
            
            return Response({
                'id': project.id,
                'name': project.name,
                'description': project.description,
                'created_at': project.created_at,
                'owner': {
                    'id': project.owner.id,
                    'username': project.owner.username,
                    'email': project.owner.email,
                    'first_name': project.owner.first_name,
                    'last_name': project.owner.last_name
                },
                'members_count': project.members.count(),
                'tasks_count': project.tasks.count()
            }, status=status.HTTP_200_OK)
            
        except Project.DoesNotExist:
            return Response({
                'error': 'Projet non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la mise à jour du projet',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, project_id):
        """Supprimer un projet"""
        try:
            project = Project.objects.get(id=project_id)
            project.delete()
            
            return Response({
                'message': 'Projet supprimé avec succès'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Project.DoesNotExist:
            return Response({
                'error': 'Projet non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la suppression du projet',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class TaskCRUDView(APIView):
    """Vue CRUD pour la gestion des tâches"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, task_id=None):
        """Lister toutes les tâches ou récupérer une tâche spécifique"""
        try:
            if task_id:
                task = Task.objects.select_related('project', 'project__owner', 'assigned_to').get(id=task_id)
                return Response({
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'status': task.status,
                    'priority': task.priority,
                    'created_at': task.created_at,
                    'updated_at': task.updated_at,
                    'due_date': task.due_date,
                    'project': {
                        'id': task.project.id,
                        'name': task.project.name,
                        'owner': {
                            'id': task.project.owner.id,
                            'username': task.project.owner.username,
                            'email': task.project.owner.email,
                            'first_name': task.project.owner.first_name,
                            'last_name': task.project.owner.last_name
                        }
                    },
                    'assigned_to': {
                        'id': task.assigned_to.id,
                        'username': task.assigned_to.username,
                        'email': task.assigned_to.email,
                        'first_name': task.assigned_to.first_name,
                        'last_name': task.assigned_to.last_name
                    } if task.assigned_to else None
                }, status=status.HTTP_200_OK)
            else:
                tasks = Task.objects.select_related('project', 'project__owner', 'assigned_to').all()
                tasks_data = []
                for task in tasks:
                    tasks_data.append({
                        'id': task.id,
                        'title': task.title,
                        'description': task.description,
                        'status': task.status,
                        'priority': task.priority,
                        'created_at': task.created_at,
                        'updated_at': task.updated_at,
                        'due_date': task.due_date,
                        'project': {
                            'id': task.project.id,
                            'name': task.project.name,
                            'owner': {
                                'id': task.project.owner.id,
                                'username': task.project.owner.username,
                                'email': task.project.owner.email,
                                'first_name': task.project.owner.first_name,
                                'last_name': task.project.owner.last_name
                            }
                        },
                        'assigned_to': {
                            'id': task.assigned_to.id,
                            'username': task.assigned_to.username,
                            'email': task.assigned_to.email,
                            'first_name': task.assigned_to.first_name,
                            'last_name': task.assigned_to.last_name
                        } if task.assigned_to else None
                    })
                return Response(tasks_data, status=status.HTTP_200_OK)
                
        except Task.DoesNotExist:
            return Response({
                'error': 'Tâche non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la récupération des tâches',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Créer une nouvelle tâche"""
        try:
            data = request.data
            project = Project.objects.get(id=data['project_id'])
            
            task = Task.objects.create(
                title=data['title'],
                description=data.get('description', ''),
                project=project,
                assigned_to=request.user,
                status=data.get('status', 'TO_DO'),
                priority=data.get('priority', 'MEDIUM')
            )
            
            return Response({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'created_at': task.created_at,
                'updated_at': task.updated_at,
                'due_date': task.due_date,
                'project': {
                    'id': task.project.id,
                    'name': task.project.name,
                    'owner': {
                        'id': task.project.owner.id,
                        'username': task.project.owner.username,
                        'email': task.project.owner.email,
                        'first_name': task.project.owner.first_name,
                        'last_name': task.project.owner.last_name
                    }
                },
                'assigned_to': {
                    'id': task.assigned_to.id,
                    'username': task.assigned_to.username,
                    'email': task.assigned_to.email,
                    'first_name': task.assigned_to.first_name,
                    'last_name': task.assigned_to.last_name
                } if task.assigned_to else None
            }, status=status.HTTP_201_CREATED)
            
        except Project.DoesNotExist:
            return Response({
                'error': 'Projet non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la création de la tâche',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, task_id):
        """Mettre à jour une tâche"""
        try:
            task = Task.objects.get(id=task_id)
            data = request.data
            
            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.status = data.get('status', task.status)
            task.priority = data.get('priority', task.priority)
            task.save()
            
            return Response({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'status': task.status,
                'priority': task.priority,
                'created_at': task.created_at,
                'updated_at': task.updated_at,
                'due_date': task.due_date,
                'project': {
                    'id': task.project.id,
                    'name': task.project.name,
                    'owner': {
                        'id': task.project.owner.id,
                        'username': task.project.owner.username,
                        'email': task.project.owner.email,
                        'first_name': task.project.owner.first_name,
                        'last_name': task.project.owner.last_name
                    }
                },
                'assigned_to': {
                    'id': task.assigned_to.id,
                    'username': task.assigned_to.username,
                    'email': task.assigned_to.email,
                    'first_name': task.assigned_to.first_name,
                    'last_name': task.assigned_to.last_name
                } if task.assigned_to else None
            }, status=status.HTTP_200_OK)
            
        except Task.DoesNotExist:
            return Response({
                'error': 'Tâche non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la mise à jour de la tâche',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, task_id):
        """Supprimer une tâche"""
        try:
            task = Task.objects.get(id=task_id)
            task.delete()
            
            return Response({
                'message': 'Tâche supprimée avec succès'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Task.DoesNotExist:
            return Response({
                'error': 'Tâche non trouvée'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'Erreur lors de la suppression de la tâche',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
