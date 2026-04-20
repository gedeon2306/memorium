# API Application - Module principal de Mémorium

Application Django principale contenant tous les modèles, vues et logique métier pour la gestion du cimetière privé Mémorium.

## Structure

```
api/
|
|-- models.py           # Modèles de données principaux
|-- views.py            # Vues API et logique métier
|-- serializers.py      # Sérialiseurs DRF
|-- urls.py             # Configuration des routes URL
|-- admin.py            # Administration Django
|-- apps.py             # Configuration application
|-- backends/           # Authentification personnalisée
|   |-- __init__.py
|   |-- email_backend.py # Backend authentification email
|
|-- templates/          # Templates email
|   |-- email_validation.html
|   |-- password_reset.html
|
|-- migrations/         # Migrations base de données
|   |-- 0001_initial.py
|   |-- 0002_*.py
|
|-- email_utils.py      # Utilitaires envoi emails
|-- tokens.py           # Gestion tokens JWT
|-- tests.py            # Tests unitaires
```

## Modèles de données

### User (Utilisateur personnalisé)
```python
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    photo = models.TextField(null=True, blank=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    dfa = models.BooleanField(default=True)
    validate_code = models.CharField(max_length=6, blank=True, null=True)
```

**Caractéristiques :**
- Authentification par email (USERNAME_FIELD = 'email')
- Rôles : Administrateur, Assistant, Testeur
- Double authentification (DFA)
- Code de validation email
- Photo profil (base64)

### Famille
```python
class Famille(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    nom_famille = models.CharField(max_length=255)
    nom_garrant = models.CharField(max_length=255)
    profession = models.CharField(max_length=50)
    telephone = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Relations :**
- 1-N avec Defunt (related_name='defunts')
- 1-N avec Paiement (related_name='paiements')

### Defunt (Défunt)
```python
class Defunt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    photo = models.TextField(null=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100, null=True, blank=True)
    genre = models.CharField(max_length=1, choices=GENRE_CHOICES)
    age = models.IntegerField()
    profession = models.CharField(max_length=50, null=True, blank=True)
    date_naiss = models.DateField()
    date_deces = models.DateField()
    place = models.IntegerField(null=True, blank=True)
    date_inhumation = models.DateField()
    date_incineration = models.DateField()
    statut = models.CharField(max_length=50, default='Inhumé')
    famille = models.ForeignKey(Famille, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Caractéristiques :**
- Genre : Masculin/Féminin
- Statut : Inhumé/Incinéré
- Emplacement (numéro de place)
- Photo profil (base64)

### Paiement
```python
class Paiement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    num_facture = models.CharField(max_length=50, unique=True)
    motif = models.CharField(max_length=50, default='Inhumation')
    montant = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date_incineration_prevue = models.DateField()
    date_paiement = models.DateTimeField(auto_now_add=True)
    moyen_paiement = models.CharField(max_length=50)
    famille = models.ForeignKey(Famille, on_delete=models.SET_NULL, null=True)
    defunt = models.ForeignKey(Defunt, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
```

## Vues API

### Authentification
- **LoginView** : Connexion avec email/mot de passe
- **LogoutView** : Déconnexion et invalidation tokens
- **RegisterView** : Inscription nouvel utilisateur
- **VerifyEmailView** : Validation email avec code
- **RefreshTokenView** : Rafraîchissement JWT tokens

### Gestion des utilisateurs
- **UserViewSet** : CRUD complet pour les utilisateurs
- **Permission par rôle** : Admin peut gérer tous les utilisateurs
- **Self-management** : Utilisateurs peuvent modifier leur profil

### Gestion des familles
- **FamilleViewSet** : CRUD complet pour les familles
- **Validation des données** : Email et téléphone uniques
- **Recherche** : Par nom, email, téléphone

### Gestion des défunts
- **DefuntViewSet** : CRUD complet pour les défunts
- **Filtrage** : Par famille, statut, dates
- **Upload photos** : Support images base64

### Gestion des paiements
- **PaiementViewSet** : CRUD complet pour les paiements
- **Génération factures** : Numéros uniques automatiques
- **Statistiques** : Agrégation par période/montant

### Statistiques
- **StatsOverviewView** : Vue d'ensemble générale
- **StatsDefuntsView** : Statistiques défunts
- **StatsPaiementsView** : Statistiques paiements

## Sérialiseurs

### UserSerializer
```python
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'photo', 'created_at', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'validators': [UniqueValidator(queryset=User.objects.all())]}
        }
```

### FamilleSerializer
```python
class FamilleSerializer(serializers.ModelSerializer):
    defunts_count = serializers.SerializerMethodField()
    paiements_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Famille
        fields = '__all__'
```

### DefuntSerializer
```python
class DefuntSerializer(serializers.ModelSerializer):
    famille_nom = serializers.CharField(source='famille.nom_famille', read_only=True)
    
    class Meta:
        model = Defunt
        fields = '__all__'
```

## Authentification

### Tokens JWT
- **Access token** : 60 minutes validité
- **Refresh token** : 24 heures validité
- **Blacklist** : Tokens invalidés lors logout

### Permissions
- **IsAuthenticated** : Utilisateur connecté requis
- **IsAdminUser** : Rôle Administrateur requis
- **IsOwnerOrAdmin** : Propriétaire ou admin pour modification

### Validation email
- Code à 6 chiffres généré aléatoirement
- Email envoyé avec template HTML
- Validation obligatoire pour activation compte

## Utilitaires

### Email utils (`email_utils.py`)
```python
def send_validation_email(user, code):
    """Envoi email de validation avec code"""
    
def send_password_reset_email(user, reset_link):
    """Envoi email de réinitialisation mot de passe"""
    
def generate_verification_code():
    """Génère code à 6 chiffres"""
```

### Tokens (`tokens.py`)
```python
def generate_access_token(user):
    """Génère JWT access token"""
    
def generate_refresh_token(user):
    """Génère JWT refresh token"""
    
def decode_token(token):
    """Décode et valide token JWT"""
```

## Tests

### Tests modèles
```python
class UserModelTest(TestCase):
    def test_create_user(self):
        """Test création utilisateur standard"""
        
    def test_create_superuser(self):
        """Test création superutilisateur"""
        
    def test_user_email_unique(self):
        """Test unicité email"""
```

### Tests vues
```python
class AuthViewTest(APITestCase):
    def test_login_success(self):
        """Test connexion réussie"""
        
    def test_login_invalid_credentials(self):
        """Test connexion échouée"""
```

## Administration Django

### Configuration admin
```python
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['email', 'name']
```

### Fonctionnalités admin
- **Gestion utilisateurs** : CRUD interface
- **Validation manuelle** : Activation comptes
- **Export données** : CSV/Excel
- **Actions bulk** : Mises à jour groupées

## Développement

### Commandes utiles
```bash
# Créer migrations
python manage.py makemigrations api

# Appliquer migrations
python manage.py migrate

# Shell Django
python manage.py shell

# Créer superutilisateur
python manage.py createsuperuser

# Tests
python manage.py test api
```

### Debugging
```python
# Debug SQL queries
from django.db import connection
print(connection.queries)

# Debug serializer errors
serializer = UserSerializer(data=data)
if not serializer.is_valid():
    print(serializer.errors)
```

## Sécurité

### Validation des données
- **Emails** : Format et unicité validés
- **Téléphones** : Format standardisé
- **Dates** : Cohérence chronologique
- **Montants** : Format décimal validé

### Protection contre attaques
- **SQL Injection** : Django ORM protection
- **XSS** : Échappement automatique
- **CSRF** : Tokens de protection
- **Rate Limiting** : Limitation requêtes API

## Performance

### Optimisations
- **Select Related** : Réduction requêtes SQL
- **Prefetch Related** : Optimisation relations
- **Indexation** : Champs fréquemment filtrés
- **Pagination** : Limitation résultats

### Monitoring
- **Django Debug Toolbar** : Développement
- **Sentry** : Production erreurs
- **Logging** : Traçabilité actions

## Contributeurs

- **Modèles** : Structure de données complète
- **Vues** : Logique métier et API
- **Sérialiseurs** : Validation et transformation
- **Authentification** : Sécurité renforcée

## Support

Pour toute question sur l'application API, contacter l'équipe de développement backend.

---

**API Application** - Coeur métier de Mémorium
