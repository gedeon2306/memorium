"use client";

import Navbar from "@/components/uxComponents/Navbar";
import Sidebar from "@/components/uxComponents/Sidebar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";
import { getUserProfil, getNotifications } from '@/app/actions/actions';

type user = {
  id: string,
  photo: string, 
  name: string, 
  email: string, 
  role: string
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<user | null>(null)
  const [notifications, setNotifications] = useState<notifications | null>(null)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const router = useRouter();

  const loadProfil = async () => {
    try {
      const res = await getUserProfil();
      setUser(res)
    } catch (err) {
      toast.error("Erreur lors du chargement");
    }
  };

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const res = await getNotifications();
      setNotifications(res)
    } catch (err) {
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadProfil();
    loadNotifications();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await axios.post("/api/logout");
      router.push(ROUTES.AUTH.LOGIN);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content flex overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-sky-800/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-violet-800/10 blur-3xl" />
      </div>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        user={user}
      />
      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          sidebarOpen={sidebarOpen}
          onSidebarToggle={setSidebarOpen}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          user={user}
          notifications={notifications}
          isLoadingNotifications={isLoadingNotifications}
        />
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}