# App Router - Structure principale de l'application Next.js

Structure App Router de Next.js 16 pour l'application Mémorium. Contient toutes les pages, layouts et composants principaux de l'interface utilisateur.

## Architecture

```
app/
|
|-- api/                   # Client API et utilitaires
|   |-- auth.ts           # Fonctions authentification
|   |-- users.ts          # API utilisateurs
|   |-- familles.ts       # API familles
|   |-- defunts.ts        # API défunts
|   |-- paiements.ts      # API paiements
|   |-- stats.ts          # API statistiques
|
|-- auth/                 # Pages authentification
|   |-- login/            # Page connexion
|   |-- register/         # Page inscription
|   |-- verify/           # Page validation email
|
|-- dashboard/            # Tableau de bord (protégé)
|   |-- page.tsx          # Dashboard principal
|   |-- layout.tsx        # Layout dashboard
|   |-- defunts/          # Gestion défunts
|   |-- familles/         # Gestion familles
|   |-- paiements/        # Gestion paiements
|   |-- users/            # Gestion utilisateurs
|   |-- stats/            # Statistiques
|   |-- settings/         # Paramètres
|   |-- profil/           # Profil utilisateur
|   |-- help/             # Aide et documentation
|   |-- cartes/           # Vue cartes et plan
|
|-- layout.tsx            # Layout racine
|-- page.tsx              # Page d'accueil
|-- not-found.tsx         # Page 404 personnalisée
|-- globals.css           # Styles globaux
|-- icon.png              # Icône application
```

## Pages principales

### Page d'accueil (`page.tsx`)
```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Mémorium</h1>
        <p className="text-xl mb-8">Gestion moderne des espaces mémoriels</p>
        <div className="space-x-4">
          <Link href="/auth/login" className="btn btn-primary">
            Se connecter
          </Link>
          <Link href="/auth/register" className="btn btn-secondary">
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Layout principal (`layout.tsx`)
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

## Authentification

### Login (`/auth/login/page.tsx`)
- Formulaire connexion email/mot de passe
- Validation en temps réel
- Redirection automatique après connexion
- Gestion erreurs claire

### Register (`/auth/register/page.tsx`)
- Inscription nouvel utilisateur
- Validation email unique
- Choix rôle (si autorisé)
- Envoi code validation

### Verify Email (`/auth/verify/page.tsx`)
- Saisie code à 6 chiffres
- Validation automatique
- Redirection vers dashboard

## Dashboard

### Layout dashboard (`/dashboard/layout.tsx`)
```typescript
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Page principale (`/dashboard/page.tsx`)
- Statistiques en temps réel
- Widgets principaux
- Actions rapides
- Vue d'ensemble

## Modules de gestion

### Défunts (`/dashboard/defunts/`)
- **Liste** : Tableau paginé avec filtres
- **Création** : Formulaire complet avec validation
- **Modification** : Édition inline et modale
- **Détails** : Vue complète avec photos
- **Suppression** : Confirmation et archivage

### Familles (`/dashboard/familles/`)
- **Gestion** : CRUD complet familles
- **Recherche** : Par nom, email, téléphone
- **Association** : Lien avec défunts
- **Historique** : Paiements associés

### Paiements (`/dashboard/paiements/`)
- **Facturation** : Génération automatique
- **Suivi** : État paiements
- **Export** : CSV/PDF
- **Statistiques** : Graphiques et rapports

### Utilisateurs (`/dashboard/users/`)
- **Administration** : Gestion comptes
- **Rôles** : Attribution permissions
- **Activation** : Validation comptes
- **Sécurité** : Double authentification

## Composants API

### Client API (`/api/`)
```typescript
// api/auth.ts
export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post('/auth/login/', credentials),
  
  logout: () => 
    api.post('/auth/logout/'),
  
  register: (userData: RegisterData) => 
    api.post('/auth/register/', userData),
  
  verifyEmail: (code: string) => 
    api.post('/auth/verify-email/', { code }),
};

// api/defunts.ts
export const defuntsAPI = {
  getAll: (params?: QueryParams) => 
    api.get('/defunts/', { params }),
  
  create: (data: CreateDefuntData) => 
    api.post('/defunts/', data),
  
  update: (id: string, data: UpdateDefuntData) => 
    api.put(`/defunts/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`/defunts/${id}/`),
};
```

### Configuration Axios
```typescript
// api/index.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Intercepteurs
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection vers login
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

## Routage et navigation

### Middleware authentification
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify', '/'];
  
  // Vérification authentification
  const token = request.cookies.get('auth-token')?.value;
  
  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}
```

### Navigation programmatique
```typescript
'use client';

import { useRouter } from 'next/navigation';

export function useNavigation() {
  const router = useRouter();
  
  return {
    goToDashboard: () => router.push('/dashboard'),
    goToLogin: () => router.push('/auth/login'),
    goToDefunts: () => router.push('/dashboard/defunts'),
    goToFamilles: () => router.push('/dashboard/familles'),
    goToPaiements: () => router.push('/dashboard/paiements'),
    goToUsers: () => router.push('/dashboard/users'),
    goToStats: () => router.push('/dashboard/stats'),
    goToSettings: () => router.push('/dashboard/settings'),
    goToProfil: () => router.push('/dashboard/profil'),
  };
}
```

## Styles et theming

### Styles globaux (`globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 262 95% 50%;
    --secondary: 210 40% 96%;
    --accent: 262 95% 85%;
  }
  
  .dark {
    --primary: 262 95% 60%;
    --secondary: 210 40% 8%;
    --accent: 262 95% 25%;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}
```

### Thème responsive
```typescript
// providers/theme-provider.tsx
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    setTheme(savedTheme || 'light');
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

## État et hooks

### Hook authentification
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUser().then(setUser).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);
  
  const login = async (credentials: LoginCredentials) => {
    const response = await authAPI.login(credentials);
    setToken(response.data.access);
    setUser(response.data.user);
  };
  
  const logout = async () => {
    await authAPI.logout();
    removeToken();
    setUser(null);
  };
  
  return { user, loading, login, logout };
}
```

### Hook API
```typescript
// hooks/useApi.ts
export function useApi<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setLoading(true);
    fetcher()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, dependencies);
  
  return { data, loading, error, refetch: () => fetcher().then(setData) };
}
```

## Performance et optimisation

### Code splitting
```typescript
import dynamic from 'next/dynamic';

const ChartComponent = dynamic(
  () => import('@/components/Chart'),
  { 
    loading: () => <div>Chargement...</div>,
    ssr: false 
  }
);
```

### Image optimization
```typescript
import Image from 'next/image';

export function OptimizedImage({ src, alt, ...props }) {
  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

## Tests

### Tests composants
```typescript
// __tests__/dashboard.test.tsx
describe('Dashboard', () => {
  it('should display user stats', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total défunts')).toBeInTheDocument();
    });
  });
  
  it('should navigate to defunts page', async () => {
    render(<Dashboard />);
    
    fireEvent.click(screen.getByText('Voir les défunts'));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/defunts');
  });
});
```

## Déploiement

### Build optimisé
```bash
# Build production
npm run build

# Analyse bundle
npm run build:analyze

# Export statique (si nécessaire)
npm run build:export
```

### Variables environnement
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.memorium.com
NEXT_PUBLIC_APP_NAME=Mémorium
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## Contributeurs

- **Architecture** : Next.js 16 App Router
- **Routing** : Middleware et navigation
- **API** : Client HTTP optimisé
- **Styling** : Tailwind CSS et DaisyUI

## Support

Pour toute question sur l'App Router, contacter l'équipe frontend.

---

**App Router** : Structure moderne et performante de Mémorium
