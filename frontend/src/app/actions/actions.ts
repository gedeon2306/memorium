'use server'
// src/app/actions/actions.ts
import api from '@/src/constants/api';
import { cookies } from 'next/headers';

// ─────────────────────────────────────────────
// Fonction utilitaire : renouvelle l'access token
// si Django répond 401 (token expiré)
// ─────────────────────────────────────────────
async function refreshAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) return null;

  try {
    const response = await api.post('token/refresh/', { refresh: refreshToken });
    const newAccessToken = response.data.access;

    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return newAccessToken;
  } catch (error) {
    console.error('Échec du renouvellement du token:', error);
    return null;
  }
}