from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import Profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    role = 'nurse'
    profile = None
    if hasattr(request.user, 'profile'):
        profile = request.user.profile
        role = profile.role
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'role': role,
        'clinic_name': profile.clinic_name if profile else '',
        'clinic_address': profile.clinic_address if profile else '',
        'phone': profile.phone if profile else '',
        'display_name': profile.display_name if profile else '',
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    try:
        user = User.objects.get(username=username)
        if not user.check_password(password):
            user = None
    except User.DoesNotExist:
        pass

    if user is None:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key})


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    try:
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        pass
    return Response(status=status.HTTP_204_NO_CONTENT)