'use server'
import api from '@/constants/api';
import { cookies } from 'next/headers';


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


const authConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});
 

async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) throw new Error("Non authentifié");
  return token;
}

async function readFetchResponseJson(response: Response): Promise<unknown | null> {
  const text = await response.text();
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function messageFromErrorBody(data: unknown): string {
  if (data == null) return "L’opération a échoué.";
  if (typeof data === "string") return data;
  if (typeof data !== "object") return "L’opération a échoué.";
  const o = data as Record<string, unknown>;
  if (typeof o.error === "string") return o.error;
  if (typeof o.message === "string") return o.message;
  if (typeof o.detail === "string") return o.detail;
  if (Array.isArray(o.detail) && o.detail.length > 0) {
    const first = o.detail[0];
    return typeof first === "string" ? first : String(first);
  }
  const parts: string[] = [];
  for (const v of Object.values(o)) {
    if (Array.isArray(v)) parts.push(...v.map(String));
    else if (typeof v === "string") parts.push(v);
  }
  if (parts.length) return parts.join(" ");
  return "L’opération a échoué.";
}

function messageFromSuccessBody(data: unknown): string | undefined {
  if (data && typeof data === "object" && "message" in data) {
    const m = (data as { message: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return undefined;
}

/** Résultat des suppressions via fetch (DELETE). */
export type DeleteEntityResult =
  | { success: true; message?: string }
  | { success: false; error: string }
  | null;


export async function getUserProfil() {
  const token = await getToken();

  try {
    const response = await api.get('user/profil/', authConfig(token))
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.get('user/profil/', authConfig(newToken))
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
  const token = await getToken();

  try {
    const response = action === 'updatePut' 
      ? await api.put('user/profil/', data, authConfig(token))
      : await api.post('user/profil/', data, authConfig(token));
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw error;
      try {
        const retryResponse = action === 'updatePut'
          ? await api.put('user/profil/', data, authConfig(newToken))
          : await api.post('user/profil/', data, authConfig(newToken));
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
  const token = await getToken();

  try {
      const response = await api.put('user/confirm-new-email/', data, authConfig(token))
      return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.put('user/confirm-new-email/', data, authConfig(newToken))
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
  const token = await getToken();

  const data = {
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  };

  try {
    const response = await api.put('user/update-password/', data, authConfig(token));
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return { error: "Session expirée" };
      
      try {
        const response = await api.put('user/update-password/', data, authConfig(newToken));
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


export async function deleteUserProfil() {
  const token = await getToken();

  const config = (t: string) => ({
    method: 'DELETE',
    headers: { Authorization: `Bearer ${t}`}
  });

  const baseURL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseURL}api/user/profil/`;

  try {
    const response = await fetch(url, config(token));

    if (response.status === 204 || response.status === 200) {
      return true;
    }

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return false;

      const retryResponse = await fetch(url, config(newToken));

      return retryResponse.status === 204 || retryResponse.status === 200;
    }

    console.error('Erreur suppression, status:', response.status);
    return false;

  } catch (error) {
    console.error('Erreur suppression compte:', error);
    return false;
  }
}


export async function uploadProfilPhoto(file: File) {
  const token = await getToken();

  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await api.post('user/upload-photo/', formData, authConfig(token));
    return { success: true, data: response.data };
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw error;
      try {
        const retryResponse = await api.post('user/upload-photo/', formData, authConfig(newToken));
        return { success: true, data: retryResponse.data };
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error || "Erreur lors de l'upload" };
      }
    }

    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         "Erreur lors de l'upload";
    return { error: errorMessage };
  }
}


export async function getUsersList(page: number = 1,search: string = "",ordering: string = "name-asc") {
  const token = await getToken();

  // Construction de l'URL avec les query params
  const params = new URLSearchParams({ page: String(page) });
  if (search)   params.append("search", search);
  if (ordering) params.append("ordering", ordering);
  const url = `admin/users/?${params.toString()}`;

  try {
    const response = await api.get(url, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.get(url, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Une erreur est survenue";
    return { error: errorMessage };
  }
}


export async function createUser(payload: {name: string;email: string;role: string;}) {
  const token = await getToken();
  const url = "admin/users/";
 
  try {
    const response = await api.post(url, payload, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.post(url, payload, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    return {
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Une erreur est survenue",
    };
  }
}


export async function updateUser(payload: {id: string; name: string;email: string;role: string;}) {
  const token = await getToken();
  const url = "admin/users/";
 
  try {
    const response = await api.put(url, payload, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.put(url, payload, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    return {
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Une erreur est survenue",
    };
  }
}


export async function deleteUser(payload: { id: string }): Promise<DeleteEntityResult> {
  const token = await getToken();
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const base = raw.replace(/\/+$/, "");
  const url = `${base}/api/admin/users/`;

  const getConfig = (t: string): RequestInit => ({
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  try {
    let response = await fetch(url, getConfig(token));

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      response = await fetch(url, getConfig(newToken));
    }

    const data = await readFetchResponseJson(response);

    if (response.ok) {
      return {
        success: true,
        message: messageFromSuccessBody(data),
      };
    }

    return { success: false, error: messageFromErrorBody(data) };
  } catch {
    return { success: false, error: "Une erreur réseau est survenue." };
  }
}


export async function getFamiliesList(page: number = 1, search: string = "", ordering: string = "name-asc") {
  const token = await getToken();

  const params = new URLSearchParams({ page: String(page) });
  if (search) params.append("search", search);
  if (ordering) params.append("ordering", ordering);
  const url = `dashboard/familles/?${params.toString()}`;

  try {
    const response = await api.get(url, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.get(url, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Une erreur est survenue";
    return { error: errorMessage };
  }
}


export async function createFamily(payload: {
  nom_famille: string;
  nom_garrant: string;
  profession: string;
  telephone: string;
  email: string;
}) {
  const token = await getToken();
  const url = "dashboard/familles/";
 
  try {
    const response = await api.post(url, payload, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      try {
        const response = await api.post(url, payload, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    return {
      errorMessage:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Une erreur est survenue",
    };
  }
}


export async function updateFamily(payload: {
  id: string;
  nom_famille: string;
  nom_garrant: string;
  profession: string;
  telephone: string;
  email: string;
}) {
  const token = await getToken();
  const url = "dashboard/familles/";
 
  try {
    const response = await api.put(url, payload, authConfig(token));
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      const newToken = await refreshAccessToken();    
      if (!newToken) return null;
      try {
        const response = await api.put(url, payload, authConfig(newToken));
        return response.data;
      } catch (retryError: any) {
        return { error: retryError.response?.data?.error };
      }
    }
    return {
      errorMessage:
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Une erreur est survenue",
    };
  }
}


export async function deleteFamily(payload: { id: string }): Promise<DeleteEntityResult> {
  const token = await getToken();
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
  const base = raw.replace(/\/+$/, "");
  const url = `${base}/api/dashboard/familles/`;

  const getConfig = (t: string): RequestInit => ({
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  try {
    let response = await fetch(url, getConfig(token));

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) return null;
      response = await fetch(url, getConfig(newToken));
    }

    const data = await readFetchResponseJson(response);

    if (response.ok) {
      return {
        success: true,
        message: messageFromSuccessBody(data),
      };
    }

    return { success: false, error: messageFromErrorBody(data) };
  } catch {
    return { success: false, error: "Une erreur réseau est survenue." };
  }
}



