// app/api/register/route.ts
import { NextResponse } from 'next/server';
import api from '@/constants/api';

export async function POST(request: Request) {
    try {
        const body = await request.json();

         const res = await api.post('auth/register/', body);

        return NextResponse.json({ message: res.data.message }, { status: 201 });

    } catch (error: any) {
        const errorData = error.response?.data || { error: "Échec de l'inscription" };
        return NextResponse.json(errorData, { status: 400 });
    }
}