"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Venus,
  Mars,
  TrendingDown,
  Bird,
  RotateCw,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Cuboid,
  User,
  PackageOpen,
} from "lucide-react";

const cards = [
  { label: "Défunts", value: "1 284", delta: "+12%", up: true, icon: Bird, color: "text-rose-400", bg: "bg-rose-400/10" },
  { label: "Trous totals", value: "8 047", delta: "+4%", up: true, icon: Cuboid, color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Trous disponibles", value: "342", delta: "+8%", up: true, icon: PackageOpen, color: "text-sky-400", bg: "bg-sky-400/10" },
  { label: "Utilisateurs", value: "96", delta: "-2%", up: false, icon: User, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "Défunts Masculins", value: "511", delta: "+5%", up: true, icon: Mars, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { label: "Défunts Féminins", value: "29", delta: "+1%", up: true, icon: Venus, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Défunts Majeurs", value: "7", delta: "+3%", up: true, icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Défunts Mineurs", value: "184", delta: "+22%", up: true, icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-400/10" },
];

const transactions = [
  { id: "#M-4821", user: "Camille Dubois", type: "Ajout souvenir", date: "30 mars 2026", status: "Validé" },
  { id: "#M-4820", user: "Thomas Renard", type: "Archivage", date: "29 mars 2026", status: "En cours" },
  { id: "#M-4819", user: "Sophie Martin", type: "Partage", date: "28 mars 2026", status: "Validé" },
  { id: "#M-4818", user: "Lucas Bernard", type: "Suppression", date: "27 mars 2026", status: "Annulé" },
  { id: "#M-4817", user: "Inès Lefèvre", type: "Export PDF", date: "26 mars 2026", status: "Validé" },
];

const progresses = [
  { label: "Trous", value: 52, color: "progress-primary" },
  { label: "Défunts Masculins", value: 58, color: "progress-success" },
  { label: "Défunts Féminins", value: 84, color: "progress-warning" },
  { label: "Défunts Majeurs", value: 34, color: "progress-error" },
  { label: "Défunts Mineurs", value: 78, color: "progress-info" },
];

const statusBadge: Record<string, string> = {
  Validé: "badge-success",
  "En cours": "badge-warning",
  Annulé: "badge-error",
};

const user = {
  name: "Elise Fontaine",
};

export default function DashboardPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
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
      {/* Header row */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="mt-2 text-base text-neutral-400">
            Bienvenue, {user.name.split(" ")[0]} — voici votre vue d'ensemble.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm gap-2 shrink-0"
        >
          <RotateCw size={14} />
          Raffraichir
        </motion.button>
      </motion.div>

      {/* 8 Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map(({ label, value, delta, up, icon: Icon, color, bg }) => (
          <motion.div
            key={label}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="card glass border border-white/6 bg-white/3 shadow-lg min-w-0"
          >
            <div className="card-body p-3 sm:p-4">
              <div className="flex items-start justify-between gap-1">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon size={25} className={color} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium shrink-0 ${up ? "text-emerald-400" : "text-rose-400"}`}>
                  {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {delta}
                </span>
              </div>
              <p className="mt-3 text-xl sm:text-2xl font-bold text-white leading-none">{value}</p>
              <p className="text-sm font-bold text-white/40 mt-1 leading-snug">{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Table + Progress */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Transactions table */}
        <motion.div variants={itemVariants} className="lg:col-span-3 min-w-0">
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">5 dernières transactions</h2>
                <button className="btn btn-ghost btn-xs gap-1 text-white/40 hover:text-white">
                  Voir tout
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="overflow-x-auto -mx-1 px-1">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-white/5 text-xs text-white/30">
                      <th className="bg-transparent font-normal">ID</th>
                      <th className="bg-transparent font-normal">Utilisateur</th>
                      <th className="bg-transparent font-normal hidden sm:table-cell">Type</th>
                      <th className="bg-transparent font-normal hidden md:table-cell">Date</th>
                      <th className="bg-transparent font-normal">Statut</th>
                      <th className="bg-transparent font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.07, duration: 0.35 }}
                        className="border-white/5 text-sm hover:bg-white/3"
                      >
                        <td className="px-2 py-3 whitespace-nowrap text-white/40 font-mono text-xs">{tx.id}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/80 text-xs sm:text-sm">{tx.user}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/50 text-xs hidden sm:table-cell">{tx.type}</td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/40 text-xs hidden md:table-cell">{tx.date}</td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <span className={`badge badge-xs border-0 ${statusBadge[tx.status]}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <button className="btn btn-ghost btn-xs btn-square text-white/20 hover:text-white/60">
                            <MoreHorizontal size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress bars */}
        <motion.div variants={itemVariants} className="lg:col-span-2 min-w-0">
          <div className="card glass border border-white/6 bg-white/3 shadow-lg h-full">
            <div className="card-body p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Indicateurs clés</h2>
                <TrendingUp size={14} className="text-white/30" />
              </div>

              <div className="space-y-4">
                {progresses.map(({ label, value, color }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50 truncate">{label}</span>
                      <span className="text-xs font-medium text-white/70 shrink-0">{value}%</span>
                    </div>
                    <progress
                      className={`progress ${color} h-1.5 w-full bg-white/8`}
                      value={value}
                      max="100"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
