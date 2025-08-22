from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    # Nó đảm bảo rằng chỉ gọi 1 lần khi user được tạo, không bao gồm lần cập nhật
    if created:
        Profile.objects.create(user=instance)