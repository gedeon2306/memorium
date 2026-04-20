"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Shield, Undo2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const Forbidden = () => {
  const router = useRouter();

  return (
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
            <div className="flex justify-center items-center gap-4 mb-4">
              <Shield size={40} className="text-red-500" />
              <p className="text-[8rem] leading-none font-semibold tracking-tight text-red-500 sm:text-[9rem] md:text-[15rem]">
                403
              </p>
              <Shield size={40} className="text-red-500" />
            </div>
            <p className="text-sm text-base-content/60">
              Accès refusé
            </p>
          </div>

          {/* BOTTOM */}
          <div className="mx-auto w-full max-w-xl pb-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Oups, vous n'avez pas accès à cette page.
            </h1>
            <p className="mt-3 text-sm text-base-content/60">
              Cette ressource est protégée et nécessite des permissions spécifiques pour y accéder. 
              Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur ou retournez au tableau de bord.
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

              <Link href={ROUTES.DASHBOARD.ROOT} className="btn btn-primary w-full">
                <Home size={18} />
                Tableau de bord
              </Link>
            </div>

            {/* Message d'aide supplémentaire */}
            <div className="mt-6 p-4 bg-base-200/50 rounded-lg border border-base-300/50">
              <p className="text-xs text-base-content/50">
                <strong>Besoin d'aide ?</strong> Vérifiez que vous êtes connecté avec le bon compte 
                ou contactez votre administrateur pour obtenir les permissions nécessaires.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Forbidden;
