 "use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Alert from "@/src/components/Alert";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      handleAlert("warning", "Connexion réussie !");
    }, 2000);
  }

  const handleAlert = (type: "info" | "success" | "warning" | "error", message: string) => {
    const alert = document.getElementById(`${type}-alert`);
    const messageElement = document.getElementById(`${type}-message`)
    if (alert && messageElement) {
      alert.classList.remove("hidden");
      (messageElement as HTMLElement).textContent = message;
      setTimeout(() => {
        alert.classList.add("hidden");
      }, 10000);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content">
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
                  <Image src="/icon.png" alt="Logo" width={36} height={36} />
                </div>
                <div>
                  <p className="text-sm text-primary">Memorium</p>
                  <h1 className="text-2xl text-primary font-semibold tracking-tight">Sanctuaire Privé</h1>
                </div>
              </div>
              
              <p className="mt-6 leading-relaxed text-base-content">
                La mémoire est le seul paradis dont on ne peut être chassé.
              </p>

              <p className="mt-6 leading-relaxed text-base-content">
                Ouvrez un espace dédié à votre cimetière privé de luxe. Une interface calme,
                un accès contrôlé et des repères clairs pour avancer sereinement.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Onboarding fluide</p>
                  <p className="mt-1 text-xs opacity-60">Minimal & guidé</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Confidentialité</p>
                  <p className="mt-1 text-xs opacity-60">Accès réservé</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Suivi</p>
                  <p className="mt-1 text-xs opacity-60">Historique & actions</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-base-100/10 p-4">
                  <p className="text-sm font-medium">Design apaisant</p>
                  <p className="mt-1 text-xs opacity-60">Serein au quotidien</p>
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
              <div className="card glass border border-white/10 shadow-2xl">
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="card-title text-xl">Créer un compte</h2>
                      <p className="mt-1 text-sm text-base-content/60">
                        Commencez en quelques étapes.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
                      <Lock size={18} />
                    </div>
                  </div>

                  <form
                    className="mt-4 space-y-4 text-base-content"
                    onSubmit={handleSubmit}
                    aria-label="Formulaire d'inscription"
                  >
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content">Nom complet</span>
                      </label>
                      <div className="relative">
                        <User
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60"
                          size={18}
                        />
                        <input
                          className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10"
                          type="text"
                          name="fullName"
                          autoComplete="name"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content">Email</span>
                      </label>
                      <div className="relative">
                        <Mail
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60"
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
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60"
                          size={18}
                        />
                        <input
                          className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10 pr-12"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="new-password"
                          placeholder="Créer un mot de passe"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-base-content/60 hover:text-base-content transition-colors"
                          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary w-full group overflow-hidden"
                    >
                      {loading ? <span className="loading loading-spinner w-4 h-4"></span> : ""}
                      {loading ? "Création..." : "Créer mon compte"}
                    </button>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-base-content/60">
                        Déjà un compte ?{" "}
                        <Link href="/auth/login" className="link link-hover">
                          Connexion
                        </Link>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <Phone size={16} />
                        <span>Support (UI)</span>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </section>
        </motion.div>
        <Alert/>
      </div>
    </div>
  );
}

