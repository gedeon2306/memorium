"use client";

import { motion } from "framer-motion";
import { Archive } from "lucide-react";

export default function FamillesPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white">Familles</h1>
        <p className="mt-2 text-base text-neutral-400">
          Consultez vos archives et éléments archivés.
        </p>
      </div>

      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-8 text-center">
          <Archive className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Section en construction</h2>
          <p className="text-neutral-400">
            Cette page sera bientôt disponible avec la gestion de vos archives.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
