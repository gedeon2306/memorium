# Mémorium - Application de gestion d'un cimetière privé

Application web fullstack moderne pour la gestion complète d'un cimetière privé. Mémorium permet de gérer les familles, les défunts, les paiements et les utilisateurs avec une interface intuitive et sécurisée.

## Architecture du projet

```
memorium/
|
|-- backend/                 # API Django REST Framework
|   |-- api/                # Application principale
|   |   |-- models.py       # Modèles de données (User, Famille, Defunt, Paiement)
|   |   |-- views.py        # Vues API et logique métier
|   |   |-- serializers.py  # Sérialiseurs DRF
|   |   |-- urls.py         # Routes API
|   |   |-- backends/       # Authentification personnalisée
|   |   |-- templates/      # Templates email
|   |   |-- migrations/     # Migrations Django
|   |   |-- email_utils.py  # Utilitaires email
|   |   |-- tokens.py       # Gestion tokens JWT
|   |-- manage.py           # Script gestion Django
|   |-- requirements.txt    # Dépendances Python
|   |-- .env.example        # Variables environnement
|   |-- db.sqlite3          # Base de données SQLite
|
|-- frontend/               # Application Next.js 16
|   |-- app/               # App Router Next.js
|   |   |-- api/           # Client API
|   |   |-- auth/          # Pages authentification
|   |   |-- dashboard/     # Tableau de bord principal
|   |   |   |-- defunts/  # Gestion défunts
|   |   |   |-- familles/ # Gestion familles
|   |   |   |-- paiements/# Gestion paiements
|   |   |   |-- users/    # Gestion utilisateurs
|   |   |   |-- stats/    # Statistiques
|   |   |   |-- settings/ # Paramètres
|   |   |-- layout.tsx    # Layout principal
|   |   |-- page.tsx       # Page d'accueil
|   |-- public/           # Assets statiques
|   |-- package.json      # Dépendances Node.js
|   |-- next.config.ts    # Configuration Next.js
|   |-- tailwind.config.ts # Configuration Tailwind
|   |-- middleware.ts     # Middleware authentification
|
|-- README.md             # Documentation du projet
```

## Technologies utilisées

### Backend
- **Django 6.0.3** - Framework web Python
- **Django REST Framework 3.17.1** - API REST
- **Simple JWT 5.5.1** - Authentification JWT
- **Django CORS Headers 4.9.0** - Gestion CORS
- **DRF Spectacular 0.29.0** - Documentation API OpenAPI
- **SQLite** - Base de données
- **Pillow 11.2.0** - Traitement images

### Frontend
- **Next.js 16.2.1** - Framework React fullstack
- **React 19.2.4** - Bibliothèque UI
- **TypeScript 5** - Typage statique
- **Tailwind CSS 4** - Framework CSS
- **DaisyUI 5.5.19** - Composants UI
- **Lucide React 1.3.0** - Icônes
- **Motion 12.38.0** - Animations
- **Axios 1.14.0** - Client HTTP
- **React Hot Toast 2.6.0** - Notifications

## Fonctionnalités principales

### Gestion des utilisateurs
- Authentification par email/mot de passe
- Rôles : Administrateur, Assistant, Testeur
- Double authentification (DFA)
- Validation par email

### Gestion des familles
- Informations familiales complètes
- Coordonnées (téléphone, email)
- Profession du garant

### Gestion des défunts
- Informations personnelles (nom, prénom, âge, profession)
- Dates importantes (naissance, décès, inhumation)
- Statut (Inhumé, Incinéré)
- Association avec familles
- Gestion photos

### Gestion des paiements
- Facturation automatique
- Suivi des moyens de paiement
- Historique complet
- Association défunts/familles

### Tableau de bord
- Statistiques en temps réel
- Interface responsive
- Navigation intuitive
- Export de données

## Installation

### Prérequis
- Python 3.8+
- Node.js 18+
- npm ou yarn

### Backend
```bash
cd backend

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

# Démarrer serveur
python manage.py runserver
```

### Frontend
```bash
cd frontend

# Installer dépendances
npm install

# Configurer variables environnement
cp .env.example .env
# Éditer .env avec l'URL de l'API

# Démarrer serveur développement
npm run dev
```

## Configuration

### Variables d'environnement Backend (.env)
```
DEBUG=True
SECRET_KEY=votre-clé-secrète
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_HOST=votre-smtp
EMAIL_PORT=587
EMAIL_HOST_USER=votre-email
EMAIL_HOST_PASSWORD=votre-mot-de-passe
```

### Variables d'environnement Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Mémorium
```

## Utilisation

1. Démarrer le backend : `python manage.py runserver`
2. Démarrer le frontend : `npm run dev`
3. Accéder à l'application : http://localhost:3000
4. Se connecter avec le compte administrateur créé

## API Documentation

L'API est documentée avec OpenAPI/Swagger :
- Documentation interactive : http://localhost:8000/api/docs/
- Schéma JSON : http://localhost:8000/api/schema/

## Déploiement

### Production
- Configurer `DEBUG=False`
- Utiliser une base de données PostgreSQL/MySQL
- Configurer un serveur web (Nginx + Gunicorn)
- Mettre en place HTTPS
- Configurer les variables d'environnement de production

## Contribuer

1. Forker le projet
2. Créer une branche feature : `git checkout -b feature/nouvelle-fonctionnalité`
3. Commiter les changements : `git commit -am 'Ajout nouvelle fonctionnalité'`
4. Pusher la branche : `git push origin feature/nouvelle-fonctionnalité`
5. Créer une Pull Request

## Licence

Ce projet est sous licence privée.

## Support

Pour toute question ou problème, veuillez contacter l'équipe de développement.

---

**Mémorium** - Gestion moderne et respectueuse des espaces mémoriels