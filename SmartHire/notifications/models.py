from django.db import models
from accounts.models import User

class Notification(models.Model):
    TYPE_CHOICES = [
        ('application','Application'),('status_update','Status Update'),
        ('interview','Interview'),('general','General'),
    ]
    ICONS = {
        'application':'bi-file-earmark-person','status_update':'bi-arrow-repeat',
        'interview':'bi-camera-video','general':'bi-bell',
    }
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='general')
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def get_icon(self):
        return self.ICONS.get(self.notif_type, 'bi-bell')

    def __str__(self):
        return f"{self.recipient.username}: {self.title}"
