import { NextRequest, NextResponse } from 'next/server';
import api from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, token, action, code } = body;

    if (action == "login") {
      const res = await api.post(`auth/confirm-login/`, { uid, token, code });
      return NextResponse.json({ message: res.data.message, access: res.data.access, refresh: res.data.refresh }, { status: 200 });
    } else if (action == "register") {
      const res = await api.get(`auth/confirm-register/${uid}/${token}/`);
      return NextResponse.json({ message: res.data.message, access: res.data.access, refresh: res.data.refresh }, { status: 200 });
    } else if (action == "forgot-password") {
      const res = await api.get(`auth/confirm-password/${uid}/${token}/`);
      return NextResponse.json({ uid: res.data.uid, token: res.data.token }, { status: 200 });
    }

  } catch (error: any) {
    const errorData = error.response?.data || { error: 'Lien invalide ou expiré.' };
    return NextResponse.json(errorData, { status: 400 });
  }
}

