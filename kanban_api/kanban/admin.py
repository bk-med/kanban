from django.contrib import admin
from .models import Project
from .models import Task
admin.site.register(Project)
admin.site.register(Task)