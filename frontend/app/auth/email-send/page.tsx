"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Link, Mail } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";

function EmailSentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const email = searchParams.get('email');
  const action = searchParams.get('action');

  useEffect(() => {
    if (!email || !action) {
      toast.error('Page non trouvée');
      router.replace(ROUTES.AUTH.LOGIN);
      return;
    }
  }, [email, action, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      if (action === 'register' || action === 'forgot-password') {
        const res = await axios.post('/api/resend-email', { email, action });
        const { message } = res.data;
        toast.success(message);
      } else {
        toast.error('Données invalides')
        return
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="card glass border shadow-2xl"
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="card-title text-xl">Email envoyé</h1>
            <p className="mt-1 text-sm text-base-content/60">
              Un email a été envoyé à votre adresse. Veuillez vérifier votre boîte
              mail.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
            <Mail size={18} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-base-100/10 p-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-primary/80" />
            <p className="text-sm text-base-content">
              Votre lien est valable pendant <span className="font-semibold">10 minutes</span>.
            </p>
          </div>
        </div>

        <form onSubmit={handleResend} className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full group overflow-hidden"
          >
            {loading ? <span className="loading loading-spinner w-4 h-4" /> : <Link className="w-4 h-4" />}
            {loading ? "Renvoi en cours..." : "Renvoyer"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm text-base-content/60">
          Si vous ne le trouvez pas, pensez à vérifier les spams.
        </p>
      </div>
    </motion.div>
  );
}

export default function EmailSendPage() {

  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute left-1/2 -top-30 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-800/20 blur-3xl" />
        <div className="absolute -bottom-35 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-10 lg:py-16">
        <Suspense
          fallback={
            <div className="text-center">
              <div
                className="loading loading-spinner loading-lg text-primary"
                aria-label="Loading"
              />
            </div>
          }
        >
          <EmailSentContent />
        </Suspense>
      </div>
    </div>
  );
}

