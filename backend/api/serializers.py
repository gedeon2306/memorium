from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from drf_spectacular.utils import extend_schema_field
from .models import User, Famille, Defunt, Paiement, LignePaiement

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'photo', 'name', 'email', 'password', 'role', 'is_active', 'dfa', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}
    
        read_only_fields = ['id', 'is_active', 'created_at']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class FamilleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Famille
        fields = [
            'id', 'nom_famille', 'nom_garrant', 'profession', 'telephone', 
            'email', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


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
    user_name = serializers.ReadOnlyField(source='user.name')
    lignes_paiement = serializers.SerializerMethodField()
    
    class Meta:
        model = Paiement
        fields = [
            'id', 'num_facture', 'date_paiement', 'total_amount', 
            'famille', 'famille_nom', 'user', 'user_name', 'lignes_paiement'
        ]
        read_only_fields = ['user', 'id', 'date_paiement']
    
    @extend_schema_field(LignePaiementSerializer(many=True))
    def get_lignes_paiement(self, obj):
        return LignePaiementSerializer(obj.lignes.all(), many=True).data


class LignePaiementSerializer(serializers.ModelSerializer):
    defunt_nom = serializers.ReadOnlyField(source='defunt.nom')
    paiement_num_facture = serializers.ReadOnlyField(source='paiement.num_facture')
    
    class Meta:
        model = LignePaiement
        fields = [
            'id', 'paiement', 'paiement_num_facture', 'motif', 
            'montant', 'moyen_paiement', 'defunt', 'defunt_nom'
        ]
        read_only_fields = ['id', 'paiement_num_facture']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['name'] = user.name
        
        return token
    
