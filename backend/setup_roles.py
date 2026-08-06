import os
import sys
import django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile

# Create users with roles if they don't exist
users_data = [
    ('doctor', 'doctor1997', 'doctor', 'Dr. Raymond Lai'),
    ('nurse01', 'nurse-3b1e9d', 'nurse', ''),
    ('nurse02', 'nurse-3b1e9d', 'nurse', ''),
    ('admin', 'admin-5d0f6e', 'admin', ''),
]

for username, password, role, display_name in users_data:
    user, created = User.objects.get_or_create(username=username)
    user.set_password(password)
    user.save()
    if created:
        profile, _ = Profile.objects.get_or_create(
            user=user, defaults={'role': role, 'display_name': display_name}
        )
        if not _:
            profile.role = role
            profile.display_name = display_name
            profile.save()
        print(f'Created user: {username} with role: {role}')
    else:
        if hasattr(user, 'profile'):
            print(f'Updated password for: {username}')
            if user.profile.role != role or user.profile.display_name != display_name:
                user.profile.role = role
                user.profile.display_name = display_name
                user.profile.save()
                print(f'Updated user: {username} (role: {role}, display_name: {display_name})')
        else:
            profile = Profile.objects.create(user=user, role=role, display_name=display_name)
            print(f'Created profile for: {username} with role: {role}')

print('Setup complete!')