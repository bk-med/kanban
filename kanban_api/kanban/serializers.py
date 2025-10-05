from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, Task, Comment, ActivityLog
from .notifications import send_task_assigned_notification, send_task_status_changed_notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active', 'date_joined', 'last_login')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=User.objects.all(),
        source='assigned_to',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'project',
            'status', 'priority', 'assigned_to', 'assigned_to_id',
            'due_date', 'created_at', 'updated_at'
        )

    def create(self, validated_data):
        task = super().create(validated_data)
        ActivityLog.objects.create(task=task, user=self.context['request'].user, action='created task')
        
        # Envoyer notification si la tâche est assignée
        if task.assigned_to:
            send_task_assigned_notification(task, task.assigned_to)
            
        return task

    def update(self, instance, validated_data):
        old_status = instance.status
        old_assigned_to = instance.assigned_to
        
        task = super().update(instance, validated_data)
        
        # Log du changement de statut
        if old_status != task.status:
            ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'status changed to {task.status}')
            # Envoyer notification de changement de statut
            if task.assigned_to:
                send_task_status_changed_notification(task, old_status, task.status, self.context['request'].user)
        
        # Log et notification si assignation changée
        if old_assigned_to != task.assigned_to:
            if task.assigned_to:
                ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'assigned to {task.assigned_to.username}')
                send_task_assigned_notification(task, task.assigned_to)
            elif old_assigned_to:
                ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'unassigned from {old_assigned_to.username}')
                
        return task

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = '__all__'

class ProjectTaskSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les tâches d'un projet spécifique (sans champ project requis)"""
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        queryset=User.objects.all(),
        source='assigned_to',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description',
            'status', 'priority', 'assigned_to', 'assigned_to_id',
            'due_date', 'created_at', 'updated_at'
        )

    def create(self, validated_data):
        # Le projet sera ajouté dans perform_create de la vue
        task = super().create(validated_data)
        ActivityLog.objects.create(task=task, user=self.context['request'].user, action='created task')
        
        # Envoyer notification si la tâche est assignée
        if task.assigned_to:
            send_task_assigned_notification(task, task.assigned_to)
            
        return task

    def update(self, instance, validated_data):
        old_status = instance.status
        old_assigned_to = instance.assigned_to
        
        task = super().update(instance, validated_data)
        
        # Log du changement de statut
        if old_status != task.status:
            ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'status changed to {task.status}')
            # Envoyer notification de changement de statut
            if task.assigned_to:
                send_task_status_changed_notification(task, old_status, task.status, self.context['request'].user)
        
        # Log et notification si assignation changée
        if old_assigned_to != task.assigned_to:
            if task.assigned_to:
                ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'assigned to {task.assigned_to.username}')
                send_task_assigned_notification(task, task.assigned_to)
            elif old_assigned_to:
                ActivityLog.objects.create(task=task, user=self.context['request'].user, action=f'unassigned from {old_assigned_to.username}')
                
        return task
