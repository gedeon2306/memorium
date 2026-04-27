"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { dashboard } from "@/app/actions/actions";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const statusBadge: Record<string, string> = {
  Validé: "badge-success",
  "En cours": "badge-warning",
  Annulé: "badge-error",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboard();
        if (data?.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboard();
      if (data?.error) {
        setError(data.error);
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      setError("Une erreur est survenue lors du rafraîchissement");
    } finally {
      setLoading(false);
    }
  };

  // Generate cards data from API
  const generateCards = () => {
    if (!dashboardData?.statistics) return [];
    
    const stats = dashboardData.statistics;
    return [
      { label: "Défunts", value: stats.total_defunts.toString(), icon: Bird, color: "text-rose-400", bg: "bg-rose-400/10" },
      { label: "Trous totals", value: stats.total_trous.toString(), icon: Cuboid, color: "text-amber-400", bg: "bg-amber-400/10" },
      { label: "Trous disponibles", value: stats.trous_disponibles.toString(), icon: PackageOpen, color: "text-sky-400", bg: "bg-sky-400/10" },
      { label: "Utilisateurs", value: stats.total_users.toString(), icon: User, color: "text-violet-400", bg: "bg-violet-400/10" },
      { label: "Défunts Masculins", value: stats.defunts_masculins.toString(), icon: Mars, color: "text-yellow-400", bg: "bg-yellow-400/10" },
      { label: "Défunts Féminins", value: stats.defunts_feminins.toString(), icon: Venus, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { label: "Défunts Majeurs", value: stats.defunts_majeurs.toString(), icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
      { label: "Défunts Mineurs", value: stats.defunts_mineurs.toString(), icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];
  };

  // Generate progress data with color mapping
  const generateProgressData = () => {
    if (!dashboardData?.progress_data) return [];
    
    const progressColorMap: Record<string, string> = {
      "progress-primary": "progress-primary",
      "progress-secondary": "progress-secondary", 
      "progress-success": "progress-success",
      "progress-warning": "progress-warning",
      "progress-error": "progress-error",
      "progress-info": "progress-info",
      "progress-accent": "progress-accent"
    };

    return dashboardData.progress_data.map((item: any) => ({
      label: item.label,
      value: item.value,
      color: progressColorMap[item.color] || "progress-primary"
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-error text-center">
          <p className="text-lg font-semibold">Erreur de chargement</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
        <button onClick={handleRefresh} className="btn btn-primary btn-sm">
          Réessayer
        </button>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8" />
            Tableau de bord
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            Bienvenue — voici votre vue d'ensemble.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRefresh}
          disabled={loading}
          className="btn btn-primary btn-sm gap-2 shrink-0"
        >
          <RotateCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Chargement..." : "Rafraîchir"}
        </motion.button>
      </motion.div>

      {/* 8 Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {generateCards().map(({ label, value, icon: Icon, color, bg }) => (
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
                <Link href={ROUTES.DASHBOARD.PAIEMENTS} className="btn btn-ghost btn-xs gap-1 text-white/40 hover:text-white">
                  Voir tout
                  <ArrowUpRight size={12} />
                </Link>
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
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recent_transactions?.map((tx: any, i: number) => (
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
                          <span className={`badge badge-xs border-0 ${statusBadge[tx.status] || 'badge-neutral'}`}>
                            {tx.status}
                          </span>
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

              <div className="space-y-[0.7rem]">
                {generateProgressData().map((item: any, i: number) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.35 }}
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs text-white/50 truncate">{item.label}</span>
                      <span className="text-xs font-medium text-white/70 shrink-0">{item.value}%</span>
                    </div>
                    <progress
                      className={`progress ${item.color} h-1.5 w-full bg-white/8`}
                      value={item.value}
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
