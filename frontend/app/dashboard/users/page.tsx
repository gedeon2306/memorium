"use client";

import { motion } from "framer-motion";
import { BookOpen, UserRoundCog } from "lucide-react";

export default function DefuntsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserRoundCog className="w-8 h-8" />
          Utulisateurs
        </h1>
        <p className="mt-2 text-base text-neutral-400">
          Gérez et consultez vos souvenirs enregistrés.
        </p>
      </div>

      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Section en construction</h2>
          <p className="text-neutral-400">
            Cette page sera bientôt disponible avec la gestion complète de vos mémoires.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
