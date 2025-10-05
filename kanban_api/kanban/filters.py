import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    class Meta:
        model = Task
        fields = {
            'project': ['exact'],
            'status': ['exact'],
            'priority': ['exact'],
            'due_date': ['lte', 'gte'],
        }
