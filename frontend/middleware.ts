import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';

function decodeJWT(token: string) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        // Vérifier l'expiration manuellement
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return null; // Token expiré
        }
        return decoded;
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    const isAuthRoute = Object.values(ROUTES.AUTH).includes(pathname as any);
    const isDashboardRoute = pathname.startsWith(ROUTES.DASHBOARD.ROOT);
    const isUsersAdminPage = pathname === ROUTES.DASHBOARD.USERS;

    const userData = token ? decodeJWT(token) : null;

    // 1. Tentative de décodage et vérification du token
    if (!userData && isDashboardRoute) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }
    
    // 2. Protection spécifique : Page Utilisateurs (Réservée aux Administrateurs)
    if (isUsersAdminPage && userData?.role !== 'Administrateur') {
        return NextResponse.redirect(new URL('/403', request.url));
    }

    // 3. Pages d'authentification (Redirection si déjà connecté)
    if (userData && isAuthRoute) {
        if (pathname === ROUTES.AUTH.FORGOT_PASSWORD || pathname === ROUTES.AUTH.RESET_PASSWORD) {
            return NextResponse.redirect(new URL(ROUTES.DASHBOARD.PROFIL, request.url));
        }
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD.ROOT, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*', '/forbidden'],
};