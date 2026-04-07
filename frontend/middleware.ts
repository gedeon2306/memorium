import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/constants/routes';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token');
    const { pathname } = request.nextUrl;

    // Listes des routes pour simplifier les conditions
    const isAuthRoute = Object.values(ROUTES.AUTH).includes(pathname as any);
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // 1. Redirection si NON connecté : accès au dashboard interdit
    if (!token && isDashboardRoute) {
        return NextResponse.redirect(new URL(ROUTES.AUTH.LOGIN, request.url));
    }

    // 2. Redirection si DÉJÀ connecté : accès aux pages d'auth interdit
    if (token && isAuthRoute) {
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