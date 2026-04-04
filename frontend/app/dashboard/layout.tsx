"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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
      />
      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          sidebarOpen={sidebarOpen}
          onSidebarToggle={setSidebarOpen}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}