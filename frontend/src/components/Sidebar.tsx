"use client";

import {
  LayoutDashboard,
  Bird,
  ChartSpline,
  ContactRound,
  CreditCard,
  Map,
  UserRoundCog,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ROUTES } from "@/constants/routes";

const navLinks = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: ROUTES.DASHBOARD.ROOT },
  { icon: Bird, label: "Défunts", href: ROUTES.DASHBOARD.DEFUNTS },
  { icon: ContactRound, label: "Familles", href: ROUTES.DASHBOARD.FAMILLES },
  { icon: CreditCard, label: "Paiements", href: ROUTES.DASHBOARD.PAIEMENTS },
  { icon: Map, label: "Cartes", href: ROUTES.DASHBOARD.CARTES },
  { icon: ChartSpline, label: "Statistiques", href: ROUTES.DASHBOARD.STATS },
  { icon: UserRoundCog, label: "Utilisateurs", href: ROUTES.DASHBOARD.USERS },
  { icon: Settings, label: "Paramètres", href: ROUTES.DASHBOARD.SETTINGS },
  { icon: HelpCircle, label: "Aide", href: ROUTES.DASHBOARD.HELP },
];

const user = {
  name: "Elise Fontaine",
  email: "elise@memorium.app",
  avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Elise",
  role: "Administratrice",
};

interface SidebarProps {
  sidebarOpen: boolean;
  onClose?: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function Sidebar({
  sidebarOpen,
  onClose,
  onLogout,
  isLoggingOut,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (href: string) => {
    router.push(href);
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Overlay backdrop */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => onClose?.()}
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
            className="fixed md:relative z-30 md:z-10 flex w-64 shrink-0 flex-col border-r border-white/5 bg-neutral-950/80 backdrop-blur-xl inset-y-0 left-0 h-full md:h-auto overflow-hidden"
          >
            {/* Brand */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
                <Image src="/icon.png" alt="Logo" width={36} height={36} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-primary">
                Memorium
              </span>
            </div>

            {/* User info */}
            <div
              onClick={() => handleNavClick(ROUTES.DASHBOARD.PROFILE)}
              className="mx-3 mt-4 rounded-2xl border border-white/8 bg-white/4 p-3 cursor-pointer transition-all duration-200 hover:bg-white/8 hover:border-white/15"
            >
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="h-10 w-10 rounded-xl ring-1 ring-primary/30 overflow-hidden">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-white/40">{user.email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="badge badge-sm badge-outline text-white/50">
                  {user.role}
                </span>
                {pathname === ROUTES.DASHBOARD.PROFILE ? (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                ) : (
                  <ChevronRight size={12} className="text-white/30" />
                )}
              </div>
            </div>

            {/* Nav links */}
            <nav className="mt-4 flex-1 space-y-0.5 px-3 overflow-y-auto">
              {navLinks.map(({ icon: Icon, label, href }) => {
                const isActive =
                  pathname === href ||
                  (href !== ROUTES.DASHBOARD.ROOT &&
                    pathname.startsWith(href));
                return (
                  <button
                    key={href}
                    onClick={() => handleNavClick(href)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    {isActive && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}

              {/* Logout button */}
              <div className="border-t border-white/5 my-2" />
              <button
                disabled={isLoggingOut}
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-all duration-200 hover:bg-rose-500/10 hover:text-error"
              >
                {isLoggingOut ? (
                  <span className="loading loading-spinner loading-xs text-error" />
                ) : (
                  <LogOut size={16} />
                )}
                {isLoggingOut ? (
                  <span>Déconnexion...</span>
                ) : (
                  <span>Se déconnecter</span>
                )}
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}