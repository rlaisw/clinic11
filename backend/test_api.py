import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile
import json

# Check if API user response would work
for username in ['doctor', 'nurse01']:
    user = User.objects.get(username=username)
    role = 'nurse'
    if hasattr(user, 'profile'):
        role = user.profile.role
    print(f'{username}: {json.dumps({"id": user.id, "username": user.username, "role": role})}')