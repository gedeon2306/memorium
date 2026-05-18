"use client";

import {
  Bell,
  Maximize2,
  Minimize2,
  Moon,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Palette,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type user = {
  id: string;
  photo: string;
  name: string;
};

type notifications = {
  password_notification: string | null;
  incinerations_prevues: Array<{
    titre: string;
    nom: string;
    date_incineration: string;
    jours_restants: number;
    statut: string;
  }>;
};

interface NavbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  user: user | null;
  notifications: notifications | null;
  isLoadingNotifications: boolean;
}

export default function Navbar({
  sidebarOpen,
  onSidebarToggle,
  onLogout,
  isLoggingOut,
  user,
  notifications,
  isLoadingNotifications,
}: NavbarProps) {
  const { theme, changeTheme, themes } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getNotificationCount = () => {
    if (!notifications) return 0;
    let count = 0;
    if (notifications.password_notification) count++;
    count += notifications.incinerations_prevues.length;
    return count;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getStatutColors = (statut: string) => {
    if (statut === "Dépassé")
      return {
        badge: "bg-red-500/15 text-red-400",
        icon: "text-red-500",
        iconBg: "bg-red-500/10",
        delay: "text-red-400",
      };
    if (statut === "Urgent")
      return {
        badge: "bg-red-400/15 text-red-300",
        icon: "text-red-400",
        iconBg: "bg-red-400/10",
        delay: "text-red-300",
      };
    return {
      badge: "bg-amber-500/15 text-amber-400",
      icon: "text-amber-500",
      iconBg: "bg-amber-500/10",
      delay: "text-amber-400",
    };
  };

  const notifCount = getNotificationCount();

  return (
    <header className="flex items-center gap-3 border-b border-white/5 bg-neutral-950/60 px-5 py-3 backdrop-blur-xl shrink-0 relative z-[9999]">
      <button
        onClick={() => onSidebarToggle(!sidebarOpen)}
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

      <div className="ml-auto flex items-center gap-1 shrink-0">

        {/* Theme Dropdown */}
        <div className="dropdown dropdown-end relative z-[9999]">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
            <Moon size={17} />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[9999] menu p-2 shadow-xl bg-neutral-900 border border-white/10 rounded-lg w-44 mt-1"
          >
            {themes.map((t) => (
              <li key={t}>
                <button
                  onClick={() => changeTheme(t)}
                  className={`${
                    theme === t
                      ? "text-primary"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <Palette size={16} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Notifications Dropdown */}
        <div className="dropdown dropdown-end relative z-[9999]">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm btn-square relative text-white/40 hover:text-white"
          >
            {isLoadingNotifications ? (
              <span className="loading loading-spinner w-4 h-4 text-white/60"></span>
            ) : (
              <Bell size={17} />
            )}
            {!isLoadingNotifications && notifCount > 0 && (
              <span className="absolute right-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {notifCount}
              </span>
            )}
          </div>

          {/* Dropdown panel — largeur adaptée mobile */}
          <div
            tabIndex={0}
            className="dropdown-content z-[9999] shadow-2xl bg-neutral-900 border border-white/10 rounded-xl mt-2 overflow-hidden"
            style={{
              width: "min(340px, calc(100vw - 1.5rem))",
              position: "fixed",
              right: "0.75rem",
              left: "auto",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                Notifications
              </span>
              {notifCount > 0 && (
                <span className="text-xs text-white/30">{notifCount} non lue{notifCount > 1 ? "s" : ""}</span>
              )}
            </div>

            {/* Liste */}
            <ul className="max-h-80 overflow-y-auto divide-y divide-white/[0.05]">

              {/* Notification mot de passe */}
              {notifications?.password_notification && (
                <li>
                  <Link
                    href={ROUTES.DASHBOARD.PROFIL}
                    className="flex items-start gap-3 px-3 py-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mt-0.5">
                      <AlertTriangle size={15} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85 leading-tight mb-0.5">
                        Sécurité du compte
                      </p>
                      <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                        {notifications.password_notification}
                      </p>
                    </div>
                  </Link>
                </li>
              )}

              {/* Notifications incinérations */}
              {notifications?.incinerations_prevues.map((inc, index) => {
                const colors = getStatutColors(inc.statut);
                const delayLabel =
                  inc.statut === "Dépassé"
                    ? `${Math.abs(inc.jours_restants)} j. de retard`
                    : `dans ${inc.jours_restants} j.`;
                return (
                  <li key={index}>
                    <Link
                      href={ROUTES.DASHBOARD.CARTES}
                      className="flex items-center gap-3 px-3 py-3 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
                        <Flame size={15} className={colors.icon} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/85 truncate leading-tight mb-0.5">
                          {inc.titre}
                        </p>
                        <p className="text-xs text-white/40 leading-tight">
                          {inc.date_incineration}{" "}
                          <span className={`font-medium ${colors.delay}`}>
                            · {delayLabel}
                          </span>
                        </p>
                      </div>
                      <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md tracking-wide ${colors.badge}`}>
                        {inc.statut}
                      </span>
                    </Link>
                  </li>
                );
              })}

              {/* État vide */}
              {!notifications?.password_notification &&
                (!notifications?.incinerations_prevues ||
                  notifications.incinerations_prevues.length === 0) && (
                  <li className="px-3 py-8 text-center text-white/25 text-sm pointer-events-none">
                    Aucune notification
                  </li>
                )}
            </ul>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex btn btn-ghost btn-sm btn-square text-white/40 hover:text-white"
        >
          {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>

        {/* Logout */}
        <button
          disabled={isLoggingOut}
          onClick={onLogout}
          className="btn btn-ghost btn-sm btn-square text-sm text-white/40 transition-all duration-200 hover:text-error"
        >
          {isLoggingOut ? (
            <span className="loading loading-spinner loading-xs text-error" />
          ) : (
            <LogOut size={16} />
          )}
        </button>

        <div className="avatar ml-2">
          <div className="h-8 w-8 rounded-xl overflow-hidden ring-1 ring-primary/30">
            <img
              src={
                user?.photo
                  ? user?.photo
                  : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka"
              }
              alt={`${user?.name}${user?.id}`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}