# Backend Mémorium - API Django REST Framework

API REST complète pour l'application de gestion de cimetière privé Mémorium. Construite avec Django 6 et Django REST Framework.

## Architecture

```
backend/
|
|-- api/                    # Application principale
|   |-- models.py          # Modèles de données
|   |-- views.py           # Vues API et logique métier
|   |-- serializers.py     # Sérialiseurs DRF
|   |-- urls.py            # Routes API
|   |-- admin.py           # Administration Django
|   |-- apps.py            # Configuration application
|   |-- backends/          # Authentification personnalisée
|   |-- templates/         # Templates email
|   |-- migrations/        # Migrations base de données
|   |-- email_utils.py     # Utilitaires envoi emails
|   |-- tokens.py          # Gestion tokens JWT
|   |-- tests.py           # Tests unitaires
|
|-- manage.py              # Script gestion Django
|-- requirements.txt       # Dépendances Python
|-- .env.example          # Variables environnement exemple
|-- db.sqlite3            # Base de données SQLite
```

## Modèles de données

### User (Utilisateur)
- **Champs** : id, photo, name, email, role, created_at
- **Rôles** : Administrateur, Assistant, Testeur
- **Authentification** : Email + mot de passe, validation par code
- **Sécurité** : Double authentification (DFA), JWT tokens

### Famille
- **Champs** : id, nom_famille, nom_garrant, profession, telephone, email, created_at
- **Relations** : 1-N avec Defunt, Paiement

### Defunt (Défunt)
- **Champs** : id, photo, nom, prenom, genre, age, profession, dates (naissance/décès/inhumation/incinération), statut, place
- **Relations** : N-1 avec Famille, User

### Paiement
- **Champs** : id, num_facture, motif, montant, dates, moyen_paiement
- **Relations** : N-1 avec Famille, Defunt, User

## Endpoints API

### Authentification
- `POST /api/auth/login/` - Connexion
- `POST /api/auth/logout/` - Déconnexion
- `POST /api/auth/register/` - Inscription
- `POST /api/auth/verify-email/` - Validation email
- `POST /api/auth/refresh/` - Rafraîchir token

### Utilisateurs
- `GET /api/users/` - Lister utilisateurs (admin)
- `POST /api/users/` - Créer utilisateur (admin)
- `GET /api/users/{id}/` - Détails utilisateur
- `PUT /api/users/{id}/` - Modifier utilisateur
- `DELETE /api/users/{id}/` - Supprimer utilisateur

### Familles
- `GET /api/familles/` - Lister familles
- `POST /api/familles/` - Créer famille
- `GET /api/familles/{id}/` - Détails famille
- `PUT /api/familles/{id}/` - Modifier famille
- `DELETE /api/familles/{id}/` - Supprimer famille

### Défunts
- `GET /api/defunts/` - Lister défunts
- `POST /api/defunts/` - Créer défunt
- `GET /api/defunts/{id}/` - Détails défunt
- `PUT /api/defunts/{id}/` - Modifier défunt
- `DELETE /api/defunts/{id}/` - Supprimer défunt

### Paiements
- `GET /api/paiements/` - Lister paiements
- `POST /api/paiements/` - Créer paiement
- `GET /api/paiements/{id}/` - Détails paiement
- `PUT /api/paiements/{id}/` - Modifier paiement
- `DELETE /api/paiements/{id}/` - Supprimer paiement

### Statistiques
- `GET /api/stats/overview/` - Vue d'ensemble
- `GET /api/stats/defunts/` - Statistiques défunts
- `GET /api/stats/paiements/` - Statistiques paiements

## Installation

### Prérequis
- Python 3.8+
- pip

### Configuration
```bash
# Cloner le projet
git clone <repository-url>
cd memorium/backend

# Créer environnement virtuel
python -m venv venv

# Activer environnement
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer dépendances
pip install -r requirements.txt

# Configurer variables environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Appliquer migrations
python manage.py migrate

# Créer superutilisateur
python manage.py createsuperuser

# Démarrer serveur développement
python manage.py runserver
```

## Variables d'environnement

```bash
# Configuration de base
DEBUG=True
SECRET_KEY=votre-clé-secrète-très-longue
ALLOWED_HOSTS=localhost,127.0.0.1

# Configuration CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Configuration email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-app
EMAIL_USE_TLS=True

# Configuration JWT
JWT_SECRET_KEY=votre-clé-jwt-secrète
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=1440  # minutes (24h)
```

## Développement

### Commandes utiles
```bash
# Démarrer shell Django
python manage.py shell

# Créer migrations
python manage.py makemigrations

# Appliquer migrations
python manage.py migrate

# Créer superutilisateur
python manage.py createserver

# Lancer serveur de développement
python manage.py runserver

# Tests
python manage.py test

# Collecter fichiers statiques
python manage.py collectstatic
```

### Structure des vues
- **Authentification** : Login, logout, register, email verification
- **CRUD** : Opérations Create, Read, Update, Delete pour tous les modèles
- **Permissions** : Gestion des droits par rôle
- **Validation** : Validation des données entrantes
- **Sécurité** : Protection contre les attaques communes

### Sérialiseurs
- Validation des données
- Transformation JSON
- Relations entre modèles
- Champs calculés

## Sécurité

### Authentification
- Tokens JWT avec expiration
- Rafraîchissement automatique
- Validation email obligatoire
- Double authentification optionnelle

### Permissions
- Rôles basés sur les permissions Django
- Contrôle d'accès par ressource
- Validation ownership

### Protection
- CORS configuré
- CSRF protection
- SQL injection prevention
- XSS protection

## Documentation API

L'API est documentée avec DRF Spectacular (OpenAPI 3.0) :

- **Documentation interactive** : http://localhost:8000/api/docs/
- **Schéma JSON** : http://localhost:8000/api/schema/
- **Redoc** : http://localhost:8000/api/redoc/

## Tests

### Lancer les tests
```bash
# Tous les tests
python manage.py test

# Tests spécifiques
python manage.py test api.tests

# Tests avec couverture
coverage run --source='.' manage.py test
coverage report
```

### Structure des tests
- Tests unitaires pour les modèles
- Tests d'intégration pour les vues
- Tests d'authentification
- Tests de permissions

## Déploiement

### Production
```bash
# Variables production
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com

# Base de données PostgreSQL
DATABASE_URL=postgresql://user:password@host:db/name

# Serveur avec Gunicorn
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Docker
```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## Maintenance

### Sauvegarde
```bash
# Sauvegarder base de données
python manage.py dumpdata > backup.json

# Restaurer base de données
python manage.py loaddata backup.json
```

### Logs
- Logs Django dans console
- Logs d'erreurs configurables
- Monitoring avec Sentry (optionnel)

## Contributeurs

- Architecture : Django REST Framework
- Authentification : Simple JWT
- Documentation : DRF Spectacular
- Tests : Django Test Framework

## Support

Pour toute question technique sur l'API, contacter l'équipe backend.

---

**Backend Mémorium** - API robuste et sécurisée pour la gestion funéraire