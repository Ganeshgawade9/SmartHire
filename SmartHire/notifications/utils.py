from .models import Notification
def create_notification(recipient, title, message, notif_type='general', link=''):
    Notification.objects.create(recipient=recipient, title=title,
        message=message, notif_type=notif_type, link=link)
