// app/api/login/route.ts
import { NextResponse } from 'next/server';
import api from '@/constants/api'

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const res = await api.post('auth/login/', body);

        return NextResponse.json(
            { 
                message: res.data.message,
                dfa: res.data.dfa,
                access: res.data.access, 
                refresh: res.data.refresh,
                uid: res.data.uid, 
                token: res.data.token 
            }, 
            { status: 200 }
        );

    } catch (error: any) {
        const errorData = error.response?.data || { error: "Identifiants incorrects" };
        const status = error.response?.status;
        return NextResponse.json(errorData, { status: status });
    }
}