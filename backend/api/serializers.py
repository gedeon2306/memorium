from rest_framework import serializers
from .models import User, Famille, Defunt, Paiement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class FamilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Famille
        fields = '__all__'
        read_only_fields = ['user']

class DefuntSerializer(serializers.ModelSerializer):
    class Meta:
        model = Defunt
        fields = '__all__'
        read_only_fields = ['user']

class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = '__all__'
        read_only_fields = ['user']