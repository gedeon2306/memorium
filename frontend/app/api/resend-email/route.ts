import { NextRequest, NextResponse } from 'next/server';
import api from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    const res = await api.post('auth/resend-email/', { email, action });
    if (action == "login") {
      return NextResponse.json({ 
      message: res.data.message, 
      newUid: res.data.uid, 
      newToken: res.data.token 
      }, { status: 200 })
    };
    return NextResponse.json({ message: res.data.message }, { status: 200 })
    
  } catch (error: any) {
    const errorData = error.response?.data || { error: "Échec de l'envoi." };
    const status = error.response?.status;
    return NextResponse.json(errorData, { status: status });
  }
}
