from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Famille, Defunt, Paiement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'photo', 'name', 'email', 'password', 'role', 'is_active', 'dfa', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}
    
        read_only_fields = ['id', 'is_active', 'created_at']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class FamilleSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    class Meta:
        model = Famille
        fields = [
            'id', 'nom_famille', 'nom_garrant', 'profession', 'telephone', 
            'email', 'user', 'user_name', 'created_at'
        ]
        read_only_fields = ['user', 'id', 'created_at']
    

class DefuntSerializer(serializers.ModelSerializer):
    famille_details = FamilleSerializer(source='famille', read_only=True)
    user_name = serializers.ReadOnlyField(source='user.name')
    class Meta:
        model = Defunt
        fields = [
            'id', 'photo', 'nom', 'prenom', 'genre', 'age', 'profession', 
            'date_naiss', 'date_deces', 'place', 'date_inhumation', 
            'date_incineration', 'statut', 'famille', 'famille_details', 
            'user', 'user_name', 'created_at'
        ]
        read_only_fields = ['user', 'id', 'created_at']


class PaiementSerializer(serializers.ModelSerializer):
    famille_nom = serializers.ReadOnlyField(source='famille.nom_famille')
    defunt_nom = serializers.ReadOnlyField(source='defunt.nom')
    user_name = serializers.ReadOnlyField(source='user.name')
    class Meta:
        model = Paiement
        fields = [
            'id', 'num_facture', 'motif', 'montant', 'date_incineration_prevue', 
            'date_paiement', 'moyen_paiement', 'famille', 'famille_nom',
            'defunt', 'defunt_nom', 'user', 'user_name'
        ]
        read_only_fields = ['user', 'id', 'date_paiement']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['name'] = user.name
        
        return token
    
