from rest_framework import permissions
from .models import Project, Task, Comment, ActivityLog


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permission qui permet aux admins de tout faire, aux autres utilisateurs de lire seulement"""
    def has_permission(self, request, view):
        # Lecture pour tous les utilisateurs authentifiés
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        # Écriture seulement pour les admins
        return request.user.is_authenticated and request.user.is_staff


class IsAdminOrProjectMember(permissions.BasePermission):
    """Permission qui permet aux admins de tout faire, aux autres d'accéder seulement aux projets dont ils sont membres"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Les admins peuvent tout faire
        if request.user.is_staff:
            return True
        # Les autres utilisateurs doivent être membres du projet pour les opérations d'écriture
        return True  # Le filtrage sera fait dans get_queryset
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Les admins peuvent tout faire
        if request.user.is_staff:
            return True
        
        # Pour les projets
        if isinstance(obj, Project):
            return request.user in obj.members.all() or obj.owner == request.user
        # Pour les tâches
        elif isinstance(obj, Task):
            project = obj.project
            return request.user in project.members.all() or project.owner == request.user
        # Pour les commentaires
        elif isinstance(obj, Comment):
            project = obj.task.project
            return request.user in project.members.all() or project.owner == request.user
        # Pour les logs
        elif isinstance(obj, ActivityLog):
            project = obj.task.project
            return request.user in project.members.all() or project.owner == request.user
        
        return False


class IsAdminOrOwner(permissions.BasePermission):
    """Permission qui permet aux admins de tout faire, aux autres d'accéder seulement à leurs propres objets"""
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Les admins peuvent tout faire
        if request.user.is_staff:
            return True
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Les admins peuvent tout faire
        if request.user.is_staff:
            return True
        
        # Pour les projets - seul le propriétaire peut modifier
        if isinstance(obj, Project):
            if request.method in permissions.SAFE_METHODS:
                return request.user in obj.members.all() or obj.owner == request.user
            return obj.owner == request.user
        
        # Pour les tâches - membres du projet ou assigné
        elif isinstance(obj, Task):
            project = obj.project
            if request.method in permissions.SAFE_METHODS:
                return request.user in project.members.all() or project.owner == request.user
            return (request.user in project.members.all() or 
                   project.owner == request.user or 
                   obj.assigned_to == request.user)
        
        # Pour les commentaires - auteur ou membre du projet
        elif isinstance(obj, Comment):
            project = obj.task.project
            if request.method in permissions.SAFE_METHODS:
                return request.user in project.members.all() or project.owner == request.user
            return (obj.author == request.user or 
                   request.user in project.members.all() or 
                   project.owner == request.user)
        
        # Pour les logs - lecture seule pour les membres du projet
        elif isinstance(obj, ActivityLog):
            project = obj.task.project
            return request.user in project.members.all() or project.owner == request.user
        
        return False

class IsProjectOwner(permissions.BasePermission):
    """Permission pour les propriétaires de projet"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            return obj.owner == request.user
        elif hasattr(obj, 'project'):
            return obj.project.owner == request.user
        return False

class IsProjectMember(permissions.BasePermission):
    """Permission pour les membres de projet (propriétaire ou membre)"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            return request.user in obj.members.all() or obj.owner == request.user
        elif hasattr(obj, 'project'):
            project = obj.project
            return request.user in project.members.all() or project.owner == request.user
        return False

class IsTaskOwner(permissions.BasePermission):
    """Permission pour les propriétaires de tâche (créateur ou assigné)"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Task):
            # Le créateur de la tâche ou la personne assignée peut modifier
            return (obj.assigned_to == request.user or 
                   request.user in obj.project.members.all() or 
                   obj.project.owner == request.user)
        return False

class IsCommentOwner(permissions.BasePermission):
    """Permission pour les propriétaires de commentaire"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Comment):
            # L'auteur du commentaire ou les membres du projet peuvent modifier
            return (obj.author == request.user or 
                   request.user in obj.task.project.members.all() or 
                   obj.task.project.owner == request.user)
        return False

class CanManageProject(permissions.BasePermission):
    """Permission pour gérer un projet (ajouter/retirer des membres)"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            return obj.owner == request.user
        return False
