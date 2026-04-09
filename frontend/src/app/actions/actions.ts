'use server'
// src/app/actions/actions.ts
import api from '@/constants/api';
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


export async function getUserProfil() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) throw new Error("Non authentifié");

  const config = (t: string) => ({
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
  });

  try {
    const response = await api.get('user/profil/', config(token))
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.get('user/profil/', config(newToken))
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error || "Erreur lors de la mise à jour" };
      }
    }

    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Une erreur est survenue";
    return { error: errorMessage };
  }
}


export async function updateUserProfil(data: {}, action: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) throw new Error("Non authentifié");

  const config = (t: string) => ({
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
  });

  try {
    const response = action === 'updateName' 
      ? await api.put('user/profil/', data, config(token))
      : await api.post('user/profil/', data, config(token));
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw error;
      try {
        const retryResponse = action === 'updateName'
          ? await api.put('user/profil/', data, config(newToken))
          : await api.post('user/profil/', data, config(newToken));
        return { success: true, data: retryResponse.data };
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error || "Erreur lors de la mise à jour" };
      }
    }

    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Une erreur est survenue";
    return { error: errorMessage };
  }
}


export async function confirmNewEmail(data: {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) throw new Error("Non authentifié");

  const config = (t: string) => ({
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
  });

  try {
      const response = await api.put('user/confirm-new-email/', data, config(token))
      return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.put('user/confirm-new-email/', data, config(newToken))
        return { success: true, data: response.data };
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error || "Erreur lors de la mise à jour" };
      }
    }

    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Une erreur est survenue";
    return { error: errorMessage };
  }
}


export async function updatePassword(formData: FormData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) throw new Error("Non authentifié");

  const config = (t: string) => ({
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
  });

  const data = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  };

  try {
    const response = await api.put('user/update-password/', data, config(token));
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return { error: "Session expirée" };
      
      try {
        const response = await api.put('user/update-password/', data, config(newToken));
        return { success: true, data: response.data };
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error || "Erreur lors de la mise à jour" };
      }
    }

    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Une erreur est survenue";
    return { error: errorMessage };
  }
}





