"use client";
import Image from "next/image";

import { ROUTES } from "@/constants/routes";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import axios from 'axios'
import toast from "react-hot-toast";

import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    try {
      const res = await axios.post('/api/login/', data);

      const { message, dfa, access, refresh, uid, token } = res.data;

      if (!dfa) {
        await axios.post('/api/confirm-login', { access, refresh });
        toast.success(message);
        router.replace(ROUTES.DASHBOARD.ROOT);
        return
      }
      
      toast.success(message);

      const email = formData.get('email') as string;

      router.push(`${ROUTES.AUTH.CONFIRM_CODE}?email=${encodeURIComponent(email)}&uid=${uid}&token=${token}`);
      router.refresh();

    } catch (err: any) {
      toast.error(err?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-primary">
      {/* Decorative background (no custom CSS) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute left-1/2 -top-30 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-800/20 blur-3xl" />
        <div className="absolute -bottom-35 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid gap-8 lg:grid-cols-2 lg:items-center"
        >
          {/* Left split visual (desktop only) */}
          <section className="hidden lg:block">
            <div className="card glass border p-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-400/10 ring-1 ring-primary/20">
                  <Image src="/icon.png" alt="Logo" width={36} height={36} priority />
                </div>
                <div>
                  <p className="text-sm text-primary/60">Memorium</p>
                  <h1 className="text-2xl text-primary font-semibold tracking-tight">Sanctuaire Privé</h1>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-base-content">
                La mémoire est le seul paradis dont on ne peut être chassé.
              </p>

              <p className="mt-6 leading-relaxed text-base-content">
                Une expérience sereine pour organiser, suivre et préserver la mémoire dans un cadre
                exclusif. Connexion sécurisée, interface minimaliste et accès réservé.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 text-base-content">
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Vue d&apos;ensemble</p>
                  <p className="mt-1 text-xs opacity-60">Clarté et structure</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Accès sécurisé</p>
                  <p className="mt-1 text-xs opacity-60">Contrôle & confidentialité</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Suivi</p>
                  <p className="mt-1 text-xs opacity-60">Historique & actions</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Design apaisant</p>
                  <p className="mt-1 text-xs opacity-60">Minimal & élégant</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right form */}
          <section className="flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.06 }}
              className="w-full max-w-md"
            >
              <div className="card glass border shadow-2xl">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="card-title text-xl text-base-content">Connexion</h2>
                      <p className="mt-1 text-sm text-base-content/60">
                        Accédez à votre espace Memorium.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
                      <Lock size={18} />
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-4 text-base-content"
                    aria-label="Formulaire de connexion"
                  >
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content">Email</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                          size={18}
                        />
                        <input
                          className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10"
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder="vous@exemple.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content">Mot de passe</span>
                      </label>
                      <div className="relative">
                        <Lock
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                          size={18}
                        />
                        <input
                          className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10 pr-12"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="current-password"
                          placeholder="Votre mot de passe"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary/60 hover:text-primary transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={ROUTES.AUTH.FORGOT_PASSWORD}
                        className="link link-hover text-sm text-base-content hover:text-primary transition-colors"
                      >
                        Mot de passe oublié
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full group overflow-hidden"
                    >
                      {loading ? <span className="loading loading-spinner w-4 h-4"></span> : ""}
                      {loading ? "Connexion..." : "Se connecter"}
                    </button>

                    <p className="text-center text-sm text-base-content">
                      Pas encore de compte ?{" "}
                      <Link href={ROUTES.AUTH.REGISTER} className="link link-hover text-primary">
                        Inscription
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

