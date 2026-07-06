import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile

# Check users and their roles
for username in ['doctor', 'nurse01', 'admin']:
    try:
        user = User.objects.get(username=username)
        if hasattr(user, 'profile'):
            print(f'{username}: role = {user.profile.role}')
        else:
            print(f'{username}: no profile')
    except User.DoesNotExist:
        print(f'{username}: does not exist')