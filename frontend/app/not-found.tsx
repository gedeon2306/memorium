"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Undo2 } from "lucide-react";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-neutral-950 via-neutral-900 to-slate-950 text-base-content">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-blue-950/30 blur-3xl" />
        <div className="absolute left-1/2 -top-30 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-sky-800/20 blur-3xl" />
        <div className="absolute -bottom-35 right-10 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto min-h-screen max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full"
        >
          <div className="flex flex-col justify-between gap-10">
            {/* TOP */}
            <div className="pt-2 text-center">
              <p className="text-[8rem] leading-none font-semibold tracking-tight text-primary sm:text-[9rem] md:text-[15rem]">
                404
              </p>
              <p className="mt-2 text-sm text-base-content/60">
                Page introuvable
              </p>
            </div>

            {/* BOTTOM */}
            <div className="mx-auto w-full max-w-xl pb-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Oups, cette page n’existe pas.
              </h1>
              <p className="mt-3 text-sm text-base-content/60">
                La ressource que vous cherchez a peut-être été déplacée, renommée ou n'a
                jamais existé. Retournez au tableau de bord pour continuer votre navigation.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn btn-soft w-full"
                >
                  <Undo2 size={18} />
                  Retour
                </button>

                <Link href="/" className="btn btn-primary w-full">
                  <Home size={18} />
                  Accueil
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;