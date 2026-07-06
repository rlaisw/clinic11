import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile

print("Users in database:")
for user in User.objects.all():
    if hasattr(user, 'profile'):
        print(f"  {user.username}: role = {user.profile.role}")
    else:
        print(f"  {user.username}: no profile (will use default: nurse)")