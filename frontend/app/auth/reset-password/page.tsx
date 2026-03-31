 "use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Lock, RotateCw } from "lucide-react";
import toast from "react-hot-toast";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const formData = new FormData(e.currentTarget);
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Mot de passe réinitialisé. Vous pouvez vous connecter.");
    }, 2000);
  };

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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="card glass border shadow-2xl"
        >
          <div className="card-body">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="card-title text-xl">Réinitialiser le mot de passe</h1>
                <p className="mt-1 text-sm text-base-content/60">
                  Choisissez un nouveau mot de passe pour accéder à votre espace.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
                <Lock size={18} />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4 text-base-content"
              aria-label="Formulaire réinitialisation mot de passe"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Nouveau mot de passe</span>
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60"
                    size={18}
                  />
                  <input
                    className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10 pr-12"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="Nouveau mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-base-content/60 hover:text-base-content transition-colors"
                    aria-label={
                      showNewPassword ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"
                    }
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">
                    Confirmer le nouveau mot de passe
                  </span>
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60"
                    size={18}
                  />
                  <input
                    className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent pl-10 pr-12"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-base-content/60 hover:text-base-content transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Masquer la confirmation du mot de passe"
                        : "Afficher la confirmation du mot de passe"
                    }
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full group overflow-hidden"
              >
                {loading ? <span className="loading loading-spinner w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
                {loading ? "Mise à jour..." : "Réinitialiser"}
              </button>

              <p className="text-center text-sm text-base-content/60">
                Besoin de revenir en arrière ?{" "}
                <Link href={ROUTES.AUTH.LOGIN} className="link link-hover text-primary">
                  Connexion
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

