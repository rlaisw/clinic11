import django; import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from django.contrib.auth.models import User
for u in User.objects.all():
    print(f"{u.username}: superuser={u.is_superuser} staff={u.is_staff}")