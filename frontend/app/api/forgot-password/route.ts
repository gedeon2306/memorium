import { NextRequest, NextResponse } from 'next/server';
import api from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'L\'adresse email est obligatoire.' },
        { status: 400 }
      );
    }

    const res = await api.post('auth/forgot-password/', { email });

    return NextResponse.json(res.data, { status: 200 });
  } catch (error: any) {
    const errorData = error.response?.data || { error: 'Erreur lors de la demande de réinitialisation.' };
    const status = error.response?.status;
    return NextResponse.json(errorData, { status: status });
  }
}
