"""Business logic for notifications — creation, marking read."""
import logging
from apps.notifications.models import Notification

logger = logging.getLogger("kvs")


def create_notification(user, notification_type, title, message, link=""):
    notif = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )
    logger.info("Notification created for user %s: %s", user.id, title)
    return notif


def mark_notification_read(user, notification_id):
    try:
        notif = Notification.objects.get(id=notification_id, user=user)
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return notif
    except Notification.DoesNotExist:
        return None


def mark_all_notifications_read(user):
    return Notification.objects.filter(user=user, is_read=False).update(is_read=True)
