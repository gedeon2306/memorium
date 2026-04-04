"use client";

import {
  Bell,
  Maximize2,
  Minimize2,
  Moon,
  Search,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Sun,
  Monitor,
  Palette,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
  sidebarOpen: boolean;
  onSidebarToggle: (open: boolean) => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const user = {
  name: "Elise Fontaine",
  email: "elise@memorium.app",
  avatar: "https://api.dicebear.com/9.x/personas/svg?seed=Elise",
  role: "Administratrice",
};

export default function Navbar({
  sidebarOpen,
  onSidebarToggle,
  onLogout,
  isLoggingOut,
}: NavbarProps) {
  const { theme, changeTheme, themes } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications] = useState(6);

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

      {/* Search */}
      <div className="relative mx-2 hidden sm:flex flex-1 max-w-xs">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          placeholder="Rechercher..."
          className="input input-sm w-full border-white/8 bg-white/5 pl-8 text-sm text-white placeholder-white/20 focus:border-primary/40 focus:outline-none"
        />
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
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-sm btn-square relative text-white/40 hover:text-white">
            <Bell size={17} />
            {notifications > 0 && (
              <span className="absolute right-0 top-1 flex h-3 w-3 pb-0.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {notifications}
              </span>
            )}
          </button>
          <ul className="dropdown-content z-50 menu p-2 shadow bg-neutral-900/95 text-white/50 hover:text-white/80 rounded-lg border border-white/10">
            <li>
              <a>
                <Sun size={16} /> Notif 1
              </a>
            </li>
            <li>
              <a>
                <Moon size={16} /> Sombre
              </a>
            </li>
            <li>
              <a>
                <Monitor size={16} /> Auto
              </a>
            </li>
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
            <img src={user.avatar} alt={user.name} />
          </div>
        </div>
      </div>
    </header>
  );
}