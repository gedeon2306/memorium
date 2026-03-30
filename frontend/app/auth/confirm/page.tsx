 "use client";

import { motion } from "framer-motion";

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content">
      {/* Decorative background */}
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
          <p className="mt-4 text-lg font-semibold">Confirmation en cours</p>
          <p className="mt-1 text-sm text-base-content/60">
            Veuillez patienter quelques instants.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

