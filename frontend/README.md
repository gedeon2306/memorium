# Frontend Mémorium - Application Next.js 16

Interface utilisateur moderne et responsive pour l'application de gestion de cimetière privé Mémorium. Construite avec Next.js 16, React 19 et Tailwind CSS.

## Architecture

```
frontend/
|
|-- app/                    # App Router Next.js 16
|   |-- api/               # Client API et utilitaires
|   |   |-- auth.ts        # Fonctions authentification
|   |   |-- users.ts       # API utilisateurs
|   |   |-- familles.ts    # API familles
|   |   |-- defunts.ts     # API défunts
|   |   |-- paiements.ts   # API paiements
|   |   |-- stats.ts       # API statistiques
|   |-- auth/              # Pages authentification
|   |   |-- login/         # Page connexion
|   |   |-- register/      # Page inscription
|   |   |-- verify/        # Page validation email
|   |-- dashboard/         # Tableau de bord principal
|   |   |-- page.tsx       # Dashboard principal
|   |   |-- layout.tsx     # Layout dashboard
|   |   |-- defunts/       # Gestion défunts
|   |   |-- familles/      # Gestion familles
|   |   |-- paiements/     # Gestion paiements
|   |   |-- users/         # Gestion utilisateurs
|   |   |-- stats/         # Statistiques
|   |   |-- settings/      # Paramètres
|   |   |-- profil/        # Profil utilisateur
|   |   |-- help/          # Aide
|   |   |-- cartes/        # Vue cartes
|   |-- layout.tsx         # Layout principal
|   |-- page.tsx           # Page d'accueil
|   |-- not-found.tsx      # Page 404
|   |-- globals.css        # Styles globaux
|   |-- icon.png           # Icône application
|
|-- public/                # Assets statiques
|-- src/                   # Composants et utilitaires
|   |-- components/        # Composants réutilisables
|   |-- hooks/             # Hooks personnalisés
|   |-- utils/             # Utilitaires
|   |-- types/             # Types TypeScript
|
|-- package.json           # Dépendances et scripts
|-- next.config.ts         # Configuration Next.js
|-- tailwind.config.ts     # Configuration Tailwind
|-- tsconfig.json          # Configuration TypeScript
|-- eslint.config.mjs      # Configuration ESLint
|-- middleware.ts          # Middleware authentification
|-- postcss.config.mjs     # Configuration PostCSS
```

## Technologies utilisées

### Framework principal
- **Next.js 16.2.1** - Framework React fullstack avec App Router
- **React 19.2.4** - Bibliothèque UI avec dernières fonctionnalités
- **TypeScript 5** - Typage statique et sécurité du code

### Styling et UI
- **Tailwind CSS 4** - Framework CSS utility-first
- **DaisyUI 5.5.19** - Composants UI pré-construits
- **PostCSS** - Traitement CSS

### Interactivité et animations
- **Motion 12.38.0** - Animations fluides et transitions
- **Lucide React 1.3.0** - Bibliothèque d'icônes modernes
- **React Hot Toast 2.6.0** - Notifications élégantes

### Communication API
- **Axios 1.14.0** - Client HTTP avec intercepteurs
- **Middleware Next.js** - Gestion authentification

### Développement
- **ESLint 9** - Linting du code
- **ESLint Config Next.js** - Configuration Next.js

## Fonctionnalités

### Interface utilisateur
- **Design responsive** : Adaptation mobile, tablette, desktop
- **Thème clair/sombre** : Personnalisation de l'interface
- **Animations fluides** : Transitions et micro-interactions
- **Navigation intuitive** : Menu latéral et breadcrumbs

### Tableau de bord
- **Vue d'ensemble** : Statistiques en temps réel
- **Gestion rapide** : Actions principales accessibles
- **Filtrage avancé** : Recherche et filtres multi-critères
- **Export de données** : Téléchargement CSV/PDF

### Gestion des entités
- **CRUD complet** : Créer, lire, modifier, supprimer
- **Validation formulaire** : Contrôles en temps réel
- **Upload de fichiers** : Photos et documents
- **Gestion des erreurs** : Messages clairs et utiles

### Authentification
- **Login sécurisé** : Email + mot de passe
- **Validation email** : Code de confirmation
- **Gestion session** : Tokens JWT automatiques
- **Protection routes** : Middleware authentification

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Configuration
```bash
# Cloner le projet
git clone <repository-url>
cd memorium/frontend

# Installer dépendances
npm install

# Configurer variables environnement
cp .env.example .env
# Éditer .env avec l'URL de l'API backend

# Démarrer serveur développement
npm run dev
```

### Scripts disponibles
```bash
npm run dev        # Serveur développement (port 3000)
npm run build      # Build production
npm run start      # Serveur production
npm run lint       # Linting du code
```

## Variables d'environnement

```bash
# Configuration API
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Configuration application
NEXT_PUBLIC_APP_NAME=Mémorium
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuration (optionnel)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_SENTRY_DSN=votre-dsn-sentry
```

## Structure des composants

### Composants principaux
- **Layout** : Structure globale avec sidebar et header
- **Dashboard** : Tableau de bord avec widgets
- **DataTable** : Tableau paginé et filtrable
- **Form** : Formulaires avec validation
- **Modal** : Fenêtres modales réutilisables

### Hooks personnalisés
- **useAuth** : Gestion authentification
- **useApi** : Communication avec l'API
- **useLocalStorage** : Stockage local
- **useDebounce** : Recherche avec délai

### Types TypeScript
- **User** : Structure utilisateur
- **Famille** : Structure famille
- **Defunt** : Structure défunt
- **Paiement** : Structure paiement
- **APIResponse** : Réponses API génériques

## Routage

### Structure des routes
```
/                          # Page d'accueil
/auth/login               # Connexion
/auth/register            # Inscription
/auth/verify              # Validation email
/dashboard                # Tableau de bord (protégé)
/dashboard/defunts        # Gestion défunts
/dashboard/familles       # Gestion familles
/dashboard/paiements      # Gestion paiements
/dashboard/users          # Gestion utilisateurs
/dashboard/stats          # Statistiques
/dashboard/settings       # Paramètres
/dashboard/profil         # Profil utilisateur
/dashboard/help           # Aide
/dashboard/cartes         # Vue cartes
```

### Middleware
- **Protection routes** : Vérification authentification
- **Redirection** : Login/logout automatique
- **Rafraîchissement token** : Maintenance session

## Styling

### Configuration Tailwind
```javascript
// tailwind.config.ts
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        }
      }
    },
  },
  plugins: [require('daisyui')],
}
```

### Composants DaisyUI
- **Button** : Boutons avec états et variantes
- **Card** : Cartes modernes
- **Table** : Tableaux stylisés
- **Modal** : Fenêtres modales
- **Dropdown** : Menus déroulants

## État et données

### Gestion de l'état
- **Contexte Auth** : Utilisateur connecté
- **Contexte Theme** : Préférences visuelles
- **Local State** : État des composants
- **Server State** : Données de l'API

### Cache et optimisation
- **Next.js Cache** : Mise en cache automatique
- **React Query** : Cache intelligent (optionnel)
- **Image Optimization** : Optimisation images Next.js
- **Bundle Splitting** : Division automatique du code

## Performance

### Optimisations
- **Code Splitting** : Division par route
- **Tree Shaking** : Suppression code inutilisé
- **Image Optimization** : Redimensionnement automatique
- **Font Optimization** : Optimisation polices

### Monitoring
- **Web Vitals** : Métriques performance
- **Error Boundaries** : Gestion erreurs
- **Loading States** : Indicateurs de chargement

## Déploiement

### Build production
```bash
# Build optimisé
npm run build

# Lancement production
npm start
```

### Plateformes compatibles
- **Vercel** : Déploiement automatique
- **Netlify** : Build et déploiement continu
- **AWS Amplify** : Hébergement cloud
- **Docker** : Conteneurisation

### Configuration Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## Tests

### Tests unitaires
```bash
# Tests Jest (si configuré)
npm test

# Tests E2E Playwright
npm run test:e2e
```

### Tests visuels
- **Storybook** : Documentation composants
- **Chromatic** : Tests visuels automatisés
- **Lighthouse** : Audit performance

## Accessibilité

### WCAG 2.1
- **Navigation clavier** : Accessibilité complète
- **Lecteurs écran** : ARIA labels
- **Contraste** : Ratios conformes
- **Focus visible** : État focus clair

### Internationalisation
- **i18n Ready** : Structure multilingue
- **RTL Support** : Support langues RTL
- **Dates locales** : Formatage adapté

## Maintenance

### Mises à jour
```bash
# Mise à jour dépendances
npm update

# Audit sécurité
npm audit

# Mise à jour Next.js
npm install next@latest
```

### Monitoring
- **Sentry** : Suivi erreurs
- **Analytics** : Statistiques utilisation
- **Performance** : Métriques en temps réel

## Contributeurs

- **Architecture** : Next.js 16 App Router
- **Styling** : Tailwind CSS + DaisyUI
- **Animations** : Motion Framer
- **Icônes** : Lucide React

## Support

Pour toute question sur l'interface utilisateur, contacter l'équipe frontend.

---

**Frontend Mémorium** - Interface moderne et intuitive pour la gestion funéraire
