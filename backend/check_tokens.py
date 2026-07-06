import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

# Check if users have tokens
for username in ['doctor', 'nurse01']:
    user = User.objects.get(username=username)
    try:
        token = Token.objects.get(user=user)
        print(f'{username}: has token = {token.key[:20]}...')
    except Token.DoesNotExist:
        print(f'{username}: no token exists')
        # Create one
        token = Token.objects.create(user=user)
        print(f'{username}: created token = {token.key[:20]}...')