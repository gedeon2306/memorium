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
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

type user = {
  id: string,
  photo: string,
  name: string,
}

type notifications = {
  password_notification: string | null;
  incinerations_prevues: Array<{
    titre: string;
    nom: string;
    date_incineration: string;
    jours_restants: number;
    statut: string;
  }>;
}

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
  const router = useRouter();

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

  return (
    <header className="flex items-center gap-3 border-b border-white/5 bg-neutral-950/60 px-5 py-3 backdrop-blur-xl shrink-0">
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
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-sm btn-square text-white/40 hover:text-white">
            <Moon size={17} />
          </button>
          <ul className="dropdown-content z-50 menu p-2 shadow bg-neutral-900/95 rounded-lg border border-white/10">
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
        <div className="dropdown dropdown-end sm:dropdown-end">
          <button className="btn btn-ghost btn-sm btn-square relative text-white/40 hover:text-white">
            {isLoadingNotifications ? (
              <span className="loading loading-spinner w-4 h-4 text-white/60"></span>
            ) : (
              <Bell size={17} />
            )}
            {!isLoadingNotifications && getNotificationCount() > 0 && (
              <span className="absolute right-0 top-1 flex h-3 w-3 pb-0.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {getNotificationCount()}
              </span>
            )}
          </button>
          <ul className="dropdown-content z-50 menu p-3 shadow bg-neutral-900/95 text-white/50 hover:text-white/80 rounded-lg border border-white/10 max-h-96 overflow-y-auto w-[calc(100vw-2rem)] max-w-sm sm:max-w-96 fixed left-1/2 -translate-x-1/2 sm:static sm:translate-x-0">
            {notifications?.password_notification && (
              <li>
                <Link href={ROUTES.DASHBOARD.PROFIL} className="flex items-center gap-3 p-2 hover:bg-white/5">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm text-white/80">Sécurité du compte</p>
                    <p className="text-xs text-white/50">{notifications.password_notification}</p>
                  </div>
                </Link>
              </li>
            )}
            {notifications?.incinerations_prevues.map((incineration, index) => (
            <li key={index}>
              <Link href={ROUTES.DASHBOARD.CARTES} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg">
                <Calendar size={16} className={`mt-0.5 shrink-0 ${
                  incineration.statut === 'Dépassé' ? 'text-red-600' :
                  incineration.statut === 'Urgent' ? 'text-red-500' : 
                  'text-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium truncate">{incineration.titre}</p>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {incineration.statut === 'Dépassé' ? 
                      `Date d'incinération : ${incineration.date_incineration} (${Math.abs(incineration.jours_restants)} jours de retard)` :
                      `Date d'incinération : ${incineration.date_incineration} (${incineration.jours_restants} jours)`
                    }
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded shrink-0 self-start ${
                  incineration.statut === 'Dépassé' ? 'bg-red-600/20 text-red-300' :
                  incineration.statut === 'Urgent' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {incineration.statut}
                </span>
              </Link>
            </li>
          ))}
            {(!notifications?.password_notification && notifications?.incinerations_prevues.length === 0) && (
              <li className="p-4 text-center text-white/30">
                Aucune notification
              </li>
            )}
          </ul>
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
              src={user?.photo ? user?.photo : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka"} 
              alt={`${user?.name}${user?.id}`} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}