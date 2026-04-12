import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Définition des zones
    const isAuthRoute = Object.values(ROUTES.AUTH).includes(pathname as any);
    const isDashboardRoute = pathname.startsWith(ROUTES.DASHBOARD.ROOT);
    const isUsersAdminPage = pathname === ROUTES.DASHBOARD.USERS;

    let payload: any = null;

    // 1. Tentative de décodage et vérification du token
    if (token) {
        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const { payload: verifiedPayload } = await jwtVerify(token, secret);
            payload = verifiedPayload;
        } catch (error) {
            payload = null;
        }
    }

    // 2. Protection globale du Dashboard (Redirection si non connecté)
    if (!payload && isDashboardRoute) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    // 3. Protection spécifique : Page Utilisateurs (Réservée aux Administrateurs)
    if (isUsersAdminPage && payload?.role !== 'Administrateur') {
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD.ROOT, request.url));
    }

    // 4. Redirection si DÉJÀ connecté (Empêche d'aller sur Login/Register)
    if (payload && isAuthRoute) {
        if (pathname === ROUTES.AUTH.FORGOT_PASSWORD || pathname === ROUTES.AUTH.RESET_PASSWORD) {
            return NextResponse.redirect(new URL(ROUTES.DASHBOARD.PROFIL, request.url));
        } 
        return NextResponse.redirect(new URL(ROUTES.DASHBOARD.ROOT, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};