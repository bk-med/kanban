from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def send_task_assigned_notification(task, assigned_user):
    """Envoie une notification quand une tâche est assignée à un utilisateur"""
    if not assigned_user.email:
        return
    
    subject = f"Nouvelle tâche assignée : {task.title}"
    
    context = {
        'task': task,
        'assigned_user': assigned_user,
        'project': task.project,
    }
    
    # Template HTML simple (vous pouvez créer un vrai template)
    html_message = f"""
    <h2>Nouvelle tâche assignée</h2>
    <p>Bonjour {assigned_user.username},</p>
    <p>Une nouvelle tâche vous a été assignée :</p>
    <ul>
        <li><strong>Titre :</strong> {task.title}</li>
        <li><strong>Projet :</strong> {task.project.name}</li>
        <li><strong>Priorité :</strong> {task.get_priority_display()}</li>
        <li><strong>Statut :</strong> {task.get_status_display()}</li>
        <li><strong>Date d'échéance :</strong> {task.due_date or 'Non définie'}</li>
    </ul>
    <p>Description : {task.description or 'Aucune description'}</p>
    <p>Connectez-vous à l'application pour voir plus de détails.</p>
    """
    
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[assigned_user.email],
    )
    email.content_subtype = "html"
    email.send()

def send_task_status_changed_notification(task, old_status, new_status, user):
    """Envoie une notification quand le statut d'une tâche change"""
    if not task.assigned_to or not task.assigned_to.email:
        return
    
    subject = f"Statut de tâche modifié : {task.title}"
    
    context = {
        'task': task,
        'old_status': old_status,
        'new_status': new_status,
        'user': user,
        'project': task.project,
    }
    
    html_message = f"""
    <h2>Statut de tâche modifié</h2>
    <p>Bonjour {task.assigned_to.username},</p>
    <p>Le statut de votre tâche a été modifié :</p>
    <ul>
        <li><strong>Titre :</strong> {task.title}</li>
        <li><strong>Projet :</strong> {task.project.name}</li>
        <li><strong>Ancien statut :</strong> {old_status}</li>
        <li><strong>Nouveau statut :</strong> {new_status}</li>
        <li><strong>Modifié par :</strong> {user.username}</li>
    </ul>
    <p>Connectez-vous à l'application pour voir plus de détails.</p>
    """
    
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[task.assigned_to.email],
    )
    email.content_subtype = "html"
    email.send()

def send_task_due_soon_notification(task):
    """Envoie une notification pour les tâches proches de la date d'échéance"""
    if not task.assigned_to or not task.assigned_to.email:
        return
    
    subject = f"Tâche proche de l'échéance : {task.title}"
    
    html_message = f"""
    <h2>Tâche proche de l'échéance</h2>
    <p>Bonjour {task.assigned_to.username},</p>
    <p>Votre tâche approche de sa date d'échéance :</p>
    <ul>
        <li><strong>Titre :</strong> {task.title}</li>
        <li><strong>Projet :</strong> {task.project.name}</li>
        <li><strong>Date d'échéance :</strong> {task.due_date}</li>
        <li><strong>Statut actuel :</strong> {task.get_status_display()}</li>
    </ul>
    <p>N'oubliez pas de finaliser cette tâche à temps !</p>
    """
    
    email = EmailMessage(
        subject=subject,
        body=html_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[task.assigned_to.email],
    )
    email.content_subtype = "html"
    email.send()




