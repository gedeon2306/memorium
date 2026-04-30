# Frontend Mémorium - Application Next.js 16

Interface utilisateur moderne, responsive et intuitive pour l'application de gestion de cimetière privé Mémorium. Construite avec Next.js 16.2.1, React 19.2.4 et Tailwind CSS 4, cette application offre une expérience utilisateur exceptionnelle avec des animations fluides et un design moderne.

## Statut du frontend

**Version actuelle : 1.0.0**  
**Statut : Fonctionnel et en développement actif**  
**Dernière mise à jour : Avril 2026**

### Fonctionnalités implémentées
- **Authentification complète** avec validation email
- **Dashboard interactif** avec statistiques en temps réel
- **Gestion des défunts** avec photos et modal de visualisation
- **Gestion des familles** avec association automatique
- **Gestion des paiements** avec facturation et export
- **Cartographie interactive** du cimetière
- **Centre d'aide** avec documentation intégrée
- **Interface responsive** avec animations fluides
- **Système de notifications** avec React Hot Toast

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
|   |   |-- confirm/       # Page validation email
|   |   |-- confirm-code/  # Code de confirmation
|   |   |-- email-send/    # Email envoyé
|   |   |-- forgot-password/ # Mot de passe oublié
|   |   |-- reset-password/ # Réinitialiser mot de passe
|   |-- dashboard/         # Tableau de bord principal
|   |   |-- page.tsx       # Dashboard avec statistiques
|   |   |-- layout.tsx     # Layout dashboard
|   |   |-- defunts/       # Gestion défunts
|   |   |-- familles/      # Gestion familles
|   |   |-- paiements/     # Gestion paiements
|   |   |   |-- lignes/    # Détails paiements
|   |   |-- users/         # Gestion utilisateurs
|   |   |-- stats/         # Statistiques détaillées
|   |   |-- settings/      # Paramètres
|   |   |-- profil/        # Profil utilisateur
|   |   |-- help/          # Centre d'aide complet
|   |   |-- cartes/        # Vue cartographique
|   |   |-- 403/           # Page accès refusé
|   |-- layout.tsx         # Layout principal
|   |-- page.tsx           # Page d'accueil
|   |-- not-found.tsx      # Page 404
|   |-- globals.css        # Styles globaux
|   |-- icon.png           # Icône application
|
|-- public/                # Assets statiques
|-- src/                   # Composants et utilitaires
|   |-- components/        # Composants réutilisables
|   |   |-- uxComponents/  # Composants UI (Navbar, Sidebar, Modal, etc.)
|   |   |-- defuntsComponents/ # Composants spécifiques défunts
|   |   |-- famillesComponents/ # Composants spécifiques familles
|   |   |-- paiementsComponents/ # Composants spécifiques paiements
|   |-- constants/         # Constantes (routes, api)
|   |   |-- routes.ts      # Définition des routes
|   |   |-- api.ts         # Configuration API
|   |-- hooks/             # Hooks personnalisés
|   |-- utils/             # Utilitaires
|   |-- types/             # Types TypeScript
|
|-- package.json           # Dépendances et scripts
|-- next.config.ts         # Configuration Next.js
|-- tailwind.config.ts     # Configuration Tailwind
|-- tsconfig.json          # Configuration TypeScript
|-- middleware.ts          # Middleware authentification
|-- .env.example           # Variables environnement exemple
|-- eslint.config.mjs      # Configuration ESLint
|-- postcss.config.mjs     # Configuration PostCSS
```

## 🚀 Technologies et dépendances

### Framework principal
- **Next.js 16.2.1** - Framework React fullstack avec App Router
- **React 19.2.4** - Bibliothèque UI avec dernières fonctionnalités et hooks
- **TypeScript 5** - Typage statique et sécurité du code

### Styling et UI
- **Tailwind CSS 4** - Framework CSS utility-first avec PostCSS
- **DaisyUI 5.5.19** - Composants UI pré-construits et modernes
- **PostCSS** - Traitement CSS optimisé

### Interactivité et animations
- **Motion 12.38.0** - Animations fluides et transitions Framer
- **Lucide React 1.3.0** - Bibliothèque d'icônes modernes et cohérentes
- **React Hot Toast 2.6.0** - Notifications élégantes et non-intrusives

### Communication API
- **Axios 1.14.0** - Client HTTP avec intercepteurs et gestion d'erreurs
- **Middleware Next.js** - Gestion authentification et protection des routes

### Développement et qualité
- **ESLint 9** - Linting du code avec configuration Next.js
- **ESLint Config Next.js** - Règles optimisées pour Next.js 16

## ✨ Fonctionnalités principales

### 🎨 Interface utilisateur moderne
- **Design responsive** : Adaptation parfaite mobile, tablette, desktop
- **Thème clair/sombre** : Personnalisation complète de l'interface
- **Animations fluides** : Transitions élégantes avec Motion Framer
- **Navigation intuitive** : Menu latéral collapsible et breadcrumbs
- **Micro-interactions** : Feedback visuel sur toutes les actions

### 📊 Tableau de bord avancé
- **Vue d'ensemble** : Statistiques en temps réel avec graphiques
- **Gestion rapide** : Actions principales accessibles en un clic
- **Filtrage avancé** : Recherche et filtres multi-critères sur toutes les entités
- **Export de données** : Téléchargement CSV/PDF avec personnalisation
- **Widgets interactifs** : Composants réutilisables et configurables

### 🏗️ Gestion complète des entités
- **CRUD complet** : Créer, lire, modifier, supprimer avec validation
- **Validation formulaire** : Contrôles en temps réel et messages clairs
- **Upload de fichiers** : Photos et documents avec optimisation automatique
- **Gestion des erreurs** : Messages utiles et suggestions de correction
- **Pagination intelligente** : Navigation fluide dans les grandes listes

### 🔐 Authentification et sécurité
- **Login sécurisé** : Email + mot de passe avec validation
- **Validation email** : Code de confirmation à 6 chiffres
- **Gestion session** : Tokens JWT automatiques avec rafraîchissement
- **Protection routes** : Middleware authentification avec redirections
- **Mot de passe oublié** : Flux de récupération sécurisé

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
npm run build      # Build production optimisé
npm run start      # Serveur production
npm run lint       # Linting du code avec ESLint
npm run type-check # Vérification des types TypeScript
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
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

## Structure des composants

### Composants principaux
- **Layout** : Structure globale avec sidebar collapsible et header responsive
- **Dashboard** : Tableau de bord avec widgets interactifs et graphiques
- **DataTable** : Tableau paginé, filtrable et triable avec recherche
- **Form** : Formulaires avec validation en temps réel et feedback
- **Modal** : Fenêtres modales réutilisables avec animations
- **Card** : Cartes modernes pour l'affichage des informations
- **Loading** : Indicateurs de chargement élégants
- **ErrorBoundary** : Gestion des erreurs avec fallback UI

### Hooks personnalisés
- **useAuth** : Gestion authentification avec tokens JWT
- **useApi** : Communication avec l'API avec gestion d'erreurs
- **useLocalStorage** : Stockage local avec synchronisation
- **useDebounce** : Recherche avec délai et optimisation
- **useTheme** : Gestion du thème clair/sombre
- **usePagination** : Pagination intelligente avec cache
- **useModal** : Gestion des fenêtres modales
- **useToast** : Notifications système

### Types TypeScript
- **User** : Structure utilisateur avec permissions
- **Famille** : Structure famille avec coordonnées
- **Defunt** : Structure défunt avec dates et statuts
- **Paiement** : Structure paiement avec facturation
- **APIResponse** : Réponses API génériques avec pagination
- **AuthTokens** : Tokens JWT et rafraîchissement
- **FormData** : Types pour les formulaires
- **FilterOptions** : Options de filtrage et recherche

## Routage

### Structure des routes
```
/                          # Page d'accueil publique
/auth/login               # Connexion avec validation
/auth/register            # Inscription nouvel utilisateur
/auth/verify              # Validation email avec code
/auth/forgot-password     # Mot de passe oublié
/dashboard                # Tableau de bord (protégé)
/dashboard/defunts        # Gestion défunts avec CRUD
/dashboard/familles       # Gestion familles avec recherche
/dashboard/paiements      # Gestion paiements avec export
/dashboard/users          # Gestion utilisateurs (admin)
/dashboard/stats          # Statistiques avec graphiques
/dashboard/settings       # Paramètres et préférences
/dashboard/profil         # Profil utilisateur
/dashboard/help           # Aide et documentation
/dashboard/cartes         # Vue cartes et plan cimetière
```

### Middleware
- **Protection routes** : Vérification authentification JWT
- **Redirection** : Login/logout automatique selon le statut
- **Rafraîchissement token** : Maintenance session transparente
- **Logging** : Suivi des accès et erreurs
- **Rate limiting** : Protection contre les abus

## 🎨 Styling et design

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
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [require('daisyui')],
}
```

### Composants DaisyUI
- **Button** : Boutons avec états, variantes et loading
- **Card** : Cartes modernes avec images et actions
- **Table** : Tableaux stylisés avec pagination
- **Modal** : Fenêtres modales avec animations
- **Dropdown** : Menus déroulants personnalisables
- **Tabs** : Navigation par onglets
- **Alert** : Messages d'alerte et notification
- **Loading** : Spinners et indicateurs de progression
- **Form** : Champs de formulaire stylisés

## 📊 État et données

### Gestion de l'état
- **Contexte Auth** : Utilisateur connecté et permissions
- **Contexte Theme** : Préférences visuelles (clair/sombre)
- **Contexte Notifications** : Système de notifications global
- **Local State** : État des composants avec useState
- **Server State** : Données de l'API avec cache et invalidation

### Cache et optimisation
- **Next.js Cache** : Mise en cache automatique des pages
- **React Query** : Cache intelligent (optionnel)
- **Image Optimization** : Optimisation images Next.js avec WebP
- **Bundle Splitting** : Division automatique du code par route
- **Font Optimization** : Optimisation polices avec next/font

## ⚡ Performance

### Optimisations
- **Code Splitting** : Division par route et composant
- **Tree Shaking** : Suppression code inutilisé automatiquement
- **Image Optimization** : Redimensionnement automatique avec Next.js Image
- **Font Optimization** : Optimisation polices avec chargement progressif
- **Lazy Loading** : Chargement différé des composants lourds
- **Memoization** : React.memo et useMemo pour optimiser les rendus

### Monitoring
- **Web Vitals** : Métriques performance Core Web Vitals
- **Error Boundaries** : Gestion erreurs avec reporting
- **Loading States** : Indicateurs de chargement pertinents
- **Performance Budget** : Limites de taille et temps de chargement

## 🚀 Déploiement

### Build production
```bash
# Build optimisé pour la production
npm run build

# Analyse du bundle
npm run analyze

# Lancement production
npm start
```

### Plateformes compatibles
- **Vercel** : Déploiement automatique avec preview deployments
- **Netlify** : Build et déploiement continu avec forms
- **AWS Amplify** : Hébergement cloud avec CI/CD
- **Docker** : Conteneurisation pour environnements personnalisés
- **Static hosting** : Export statique pour CDN

### Configuration Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

## 🧪 Tests

### Tests unitaires
```bash
# Tests Jest (si configuré)
npm test

# Tests E2E Playwright
npm run test:e2e

# Tests d'accessibilité
npm run test:a11y
```

### Tests visuels
- **Storybook** : Documentation composants avec tests visuels
- **Chromatic** : Tests visuels automatisés et régression
- **Lighthouse CI** : Audit performance et accessibilité
- **Visual Regression** : Détection des changements visuels

## ♿ Accessibilité

### WCAG 2.1 AA
- **Navigation clavier** : Accessibilité complète sans souris
- **Lecteurs écran** : ARIA labels et descriptions complètes
- **Contraste** : Ratios conformes WCAG AA
- **Focus visible** : État focus clair et cohérent
- **Réduction mouvement** : Respect des préférences utilisateur
- **Texte adaptable** : Zoom jusqu'à 200% sans perte de fonction

### Internationalisation
- **i18n Ready** : Structure multilingue avec next-intl
- **RTL Support** : Support langues RTL (arabe, hébreu)
- **Dates locales** : Formatage adapté selon la locale
- **Devise locale** : Formatage monétaire adapté

## 🔧 Maintenance

### Mises à jour
```bash
# Mise à jour dépendances
npm update

# Audit sécurité
npm audit
npm audit fix

# Mise à jour Next.js
npm install next@latest

# Mise à jour dépendances majeures
npm install --save-interactive latest
```

### Monitoring
- **Sentry** : Suivi erreurs et performance
- **Analytics** : Statistiques utilisation anonymisées
- **Performance** : Métriques en temps réel
- **Uptime** : Surveillance disponibilité

### Bonnes pratiques
- **Code review** : Revue systématique des PR
- **Documentation** : Mise à jour continue des README
- **Tests** : Couverture minimale de 80%
- **Sécurité** : Audit trimestriel des dépendances

## 👥 Contributeurs

- **Architecture** : Next.js 16 App Router avec TypeScript
- **Styling** : Tailwind CSS 4 + DaisyUI 5.5.19
- **Animations** : Motion Framer 12.38.0
- **Icônes** : Lucide React 1.3.0
- **HTTP Client** : Axios 1.14.0 avec intercepteurs
- **Notifications** : React Hot Toast 2.6.0
- **Développement** : ESLint 9 + Prettier
- **Performance** : Next.js optimizations + Web Vitals

## 📞 Support

Pour toute question sur l'interface utilisateur, contacter l'équipe frontend.

---

**Frontend Mémorium** - Interface moderne et intuitive pour la gestion funéraire

*Version 1.0.0 - Dernière mise à jour : Avril 2026*
