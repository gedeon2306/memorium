"use client";

import { motion } from "framer-motion";
import {
  UserRoundCog,
  UserPlus,
  Search,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

const rows = [
  {
    name: "Camille Dubois",
    email: "camille.dubois@exemple.fr",
    role: "Administrateur",
    status: "Actif",
  },
  {
    name: "Thomas Renard",
    email: "thomas.renard@exemple.fr",
    role: "Éditeur",
    status: "Actif",
  },
  {
    name: "Sophie Martin",
    email: "sophie.martin@exemple.fr",
    role: "Lecteur",
    status: "Invité",
  },
  {
    name: "Lucas Bernard",
    email: "lucas.bernard@exemple.fr",
    role: "Éditeur",
    status: "Actif",
  },
  {
    name: "Inès Lefèvre",
    email: "ines.lefevre@exemple.fr",
    role: "Lecteur",
    status: "Suspendu",
  },
];

const statusBadge: Record<string, string> = {
  Actif: "badge-success",
  Invité: "badge-warning",
  Suspendu: "badge-error",
};

export default function UsersPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserRoundCog className="w-8 h-8 shrink-0" />
            Utilisateurs
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            Gérez les comptes et les rôles de votre espace Memorium.
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm gap-2 shrink-0"
        >
          <UserPlus size={16} />
          Ajouter un utilisateur
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <label className="relative flex-1 min-w-0 max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                  size={16}
                />
                <input
                  type="search"
                  placeholder="Rechercher par nom ou e-mail…"
                  className="input input-bordered input-sm w-full pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/35 focus:border-primary/50"
                  readOnly
                  aria-readonly
                />
              </label>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <ChevronsUpDown size={16} className="text-white/35 hidden sm:block" />
                <select
                  className="select select-bordered select-sm w-full sm:w-52 bg-white/5 border-white/10 text-white focus:border-primary/50"
                  defaultValue="name-asc"
                  aria-label="Trier la liste"
                >
                  <option value="name-asc">Trier par nom (A → Z)</option>
                  <option value="name-desc">Trier par nom (Z → A)</option>
                  <option value="role">Trier par rôle</option>
                  <option value="recent">Trier par dernière connexion</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-white/5 text-xs text-white/30">
                    <th className="bg-transparent font-normal">Nom</th>
                    <th className="bg-transparent font-normal hidden sm:table-cell">
                      E-mail
                    </th>
                    <th className="bg-transparent font-normal">Rôle</th>
                    <th className="bg-transparent font-normal">Statut</th>
                    <th className="bg-transparent font-normal w-12" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <motion.tr
                      key={row.email}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
                      className="border-white/5 text-sm hover:bg-white/3"
                    >
                      <td className="px-2 py-3 whitespace-nowrap text-white/90 font-medium">
                        {row.name}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-white/45 text-xs hidden sm:table-cell">
                        {row.email}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-white/60 text-xs">
                        {row.role}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span
                          className={`badge badge-xs border-0 ${statusBadge[row.status] ?? "badge-ghost"}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-square text-white/20 hover:text-white/60"
                          aria-label="Actions"
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-white/40">
                Affichage <span className="text-white/55">1–5</span> sur{" "}
                <span className="text-white/55">48</span> utilisateurs
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1 text-white/50 btn-disabled opacity-60 pointer-events-none"
                  disabled
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
                <div className="join">
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-primary min-w-9"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-ghost border border-white/10 text-white/70"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-ghost border border-white/10 text-white/70"
                  >
                    3
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-ghost btn-disabled border border-white/10 text-white/25"
                    disabled
                    aria-hidden
                  >
                    …
                  </button>
                  <button
                    type="button"
                    className="join-item btn btn-sm btn-ghost border border-white/10 text-white/70"
                  >
                    10
                  </button>
                </div>
                <button type="button" className="btn btn-ghost btn-sm gap-1 text-white/70">
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
