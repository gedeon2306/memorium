"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import toast from 'react-hot-toast';

import { motion } from "framer-motion";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const uid = searchParams.get('uid');
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!uid || !token || !action) {
      toast.error('Page non trouvée');
      router.replace(ROUTES.HOME);
      return;
    }

    const saveTokensAndRedirect = async () => {
      try {
        if (action === 'register') {

          const confirmRes = await axios.post('/api/confirm', { uid, token, action });
          const { message, access, refresh } = confirmRes.data;
          await axios.post('/api/confirm-login', { access, refresh });
          toast.success(message);
          router.replace(ROUTES.DASHBOARD.ROOT);

        } else if (action === 'forgot-password') {

          await axios.post('/api/confirm', { uid, token, action });
          router.replace(`${ROUTES.AUTH.RESET_PASSWORD}?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`);
        
        } else {
          toast.error('Données invalides');
          router.replace(ROUTES.HOME);
        }
        router.refresh();
      } catch (error: any) {
        if (error?.response?.status === 400) {
          const email = error?.response?.data?.email || '';
          toast.error(error?.response?.data.error);
          router.replace(`${ROUTES.AUTH.EMAIL_SEND}${email ? `?email=${encodeURIComponent(email)}&action=${encodeURIComponent(action)}` : ''}`);
        } else {
          toast.error('Erreur lors de la confirmation, veuillez réessayer');
          router.replace(ROUTES.AUTH.EMAIL_SEND);
        }
        router.refresh();
      }
    };

    saveTokensAndRedirect();
  }, [router, searchParams]);

  return (
    <>
      <p className="mt-4 text-lg font-semibold">Confirmation en cours</p>
      <p className="mt-1 text-sm text-base-content/60">
        Veuillez patienter quelques instants.
      </p>
    </>
  );
}

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute left-1/2 -top-30 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-800/20 blur-3xl" />
        <div className="absolute -bottom-35 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center"
        >
          <div
            className="loading loading-spinner loading-lg text-primary"
            aria-label="Chargement"
          />
          <Suspense fallback={<p className="text-[#f0f0f5]">Chargement...</p>}>
            <ConfirmContent />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}

