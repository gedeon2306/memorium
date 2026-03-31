"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Maximize2,
  Minimize2,
  ChevronRight,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Layers,
  Heart,
  Zap,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Search,
  Moon,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const user = {
  name: "Elise Fontaine",
  email: "elise@memorium.app",
  avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Elise",
  role: "Administratrice",
};

const navLinks = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: true },
  { icon: BookOpen, label: "Mémoires", active: false },
  { icon: Archive, label: "Archives", active: false },
  { icon: Star, label: "Favoris", active: false },
  { icon: FileText, label: "Rapports", active: false },
  { icon: Users, label: "Utilisateurs", active: false },
  { icon: Settings, label: "Paramètres", active: false },
  { icon: HelpCircle, label: "Aide", active: false },
];

const cards = [
  { label: "Souvenirs actifs", value: "1 284", delta: "+12%", up: true, icon: Heart, color: "text-rose-400", bg: "bg-rose-400/10" },
  { label: "Archives totales", value: "8 047", delta: "+4%", up: true, icon: Archive, color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Utilisateurs", value: "342", delta: "+8%", up: true, icon: Users, color: "text-sky-400", bg: "bg-sky-400/10" },
  { label: "Mémoires partagées", value: "96", delta: "-2%", up: false, icon: Layers, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "Favoris", value: "511", delta: "+5%", up: true, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { label: "Rapports générés", value: "29", delta: "+1%", up: true, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Temps moyen", value: "7 min", delta: "+3%", up: true, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Actions rapides", value: "184", delta: "+22%", up: true, icon: Zap, color: "text-orange-400", bg: "bg-orange-400/10" },
];

const transactions = [
  { id: "#M-4821", user: "Camille Dubois", type: "Ajout souvenir", date: "30 mars 2026", status: "Validé" },
  { id: "#M-4820", user: "Thomas Renard", type: "Archivage", date: "29 mars 2026", status: "En cours" },
  { id: "#M-4819", user: "Sophie Martin", type: "Partage", date: "28 mars 2026", status: "Validé" },
  { id: "#M-4818", user: "Lucas Bernard", type: "Suppression", date: "27 mars 2026", status: "Annulé" },
  { id: "#M-4817", user: "Inès Lefèvre", type: "Export PDF", date: "26 mars 2026", status: "Validé" },
];

const progresses = [
  { label: "Stockage utilisé", value: 72, color: "progress-primary" },
  { label: "Mémoires complètes", value: 58, color: "progress-success" },
  { label: "Médias importés", value: 84, color: "progress-warning" },
  { label: "Partages actifs", value: 34, color: "progress-error" },
  { label: "Taux de rétention", value: 91, color: "progress-info" },
  { label: "Objectif mensuel", value: 65, color: "progress-primary" },
  { label: "Engagement global", value: 47, color: "progress-success" },
  { label: "Qualité des données", value: 78, color: "progress-warning" },
];

const statusBadge: Record<string, string> = {
  Validé: "badge-success",
  "En cours": "badge-warning",
  Annulé: "badge-error",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content flex overflow-hidden relative">

      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-800/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-800/10 blur-3xl" />
      </div>

      {/* Overlay backdrop — ferme le sidebar au clic extérieur sur mobile */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 md:hidden bg-black/50 backdrop-blur-sm cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            // Sur mobile : fixed + z-30 (au-dessus de l'overlay)
            // Sur desktop : relative dans le flux normal
            className="fixed md:relative z-30 md:z-10 flex w-64 shrink-0 flex-col border-r border-white/5 bg-neutral-950/80 backdrop-blur-xl inset-y-0 left-0 h-full md:h-auto"
          >
            {/* Brand */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                <Image src="/icon.png" alt="Logo" width={36} height={36} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-primary">Memorium</span>
            </div>

            {/* User info */}
            <div className="mx-3 mt-4 rounded-2xl border border-white/8 bg-white/4 p-3">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="h-10 w-10 rounded-xl ring-1 ring-primary/30 overflow-hidden">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{user.name}</p>
                  <p className="truncate text-xs text-white/40">{user.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="badge badge-sm badge-outline text-white/50">{user.role}</span>
                <ChevronRight size={12} className="text-white/30" />
              </div>
            </div>

            {/* Nav links */}
            <nav className="mt-4 flex-1 space-y-0.5 px-3 overflow-y-auto">
              {navLinks.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              ))}
            </nav>

          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Navbar */}
        <header className="flex items-center gap-3 border-b border-white/5 bg-neutral-950/60 px-5 py-3 backdrop-blur-xl shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="btn btn-ghost btn-sm btn-square text-white/50 hover:text-white shrink-0"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-white/30 shrink-0">
            <span className="hidden sm:inline">Memorium</span>
            <ChevronRight size={13} className="hidden sm:inline" />
            <span className="text-white/70">Tableau de bord</span>
          </div>

          {/* Search */}
          <div className="relative mx-2 hidden sm:flex flex-1 max-w-xs">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-sm w-full border-white/8 bg-white/5 pl-8 text-sm text-white placeholder-white/20 focus:border-primary/40 focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 shrink-0">
            <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
              <Moon size={17} />
            </button>

            <button
              className="btn btn-ghost btn-sm btn-square relative text-white/40 hover:text-white"
            >
              <Bell size={17} />
              {notifications > 0 && (
                <span className="absolute right-0 top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {notifications}
                </span>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex btn btn-ghost btn-sm btn-square text-white/40 hover:text-white"
            >
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-all duration-200 hover:bg-rose-500/10 hover:text-error">
              <LogOut size={16} />
            </button>

            <div className="avatar ml-2">
              <div className="h-8 w-8 rounded-xl overflow-hidden ring-1 ring-primary/30">
                <img src={user.avatar} alt={user.name} />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-7">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 w-full"
          >

            {/* Header row */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-white">Tableau de bord</h1>
                <p className="mt-0.5 text-sm text-white/40">
                  Bienvenue, {user.name.split(" ")[0]} — voici votre vue d'ensemble.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary btn-sm gap-2 shrink-0"
              >
                <Zap size={14} />
                Nouveau souvenir
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
                        <Icon size={15} className={color} />
                      </div>
                      <span className={`flex items-center gap-0.5 text-xs font-medium shrink-0 ${up ? "text-emerald-400" : "text-rose-400"}`}>
                        {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {delta}
                      </span>
                    </div>
                    <p className="mt-3 text-xl sm:text-2xl font-bold text-white leading-none">{value}</p>
                    <p className="text-xs text-white/40 mt-1 leading-snug">{label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Table + Progress */}
            <div className="grid gap-5 lg:grid-cols-5">

              {/* Transactions table — scrollable horizontalement sur mobile */}
              <motion.div variants={itemVariants} className="lg:col-span-3 min-w-0">
                <div className="card glass border border-white/6 bg-white/3 shadow-lg">
                  <div className="card-body p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-white">5 dernières transactions</h2>
                      <button className="btn btn-ghost btn-xs gap-1 text-white/40 hover:text-white">
                        Voir tout <ChevronRight size={12} />
                      </button>
                    </div>

                    {/* Wrapper scrollable uniquement sur l'axe X si nécessaire */}
                    <div className="overflow-x-auto -mx-1 px-1">
                      <table className="table table-sm w-full min-w-120">
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
        </main>
      </div>
    </div>
  );
}