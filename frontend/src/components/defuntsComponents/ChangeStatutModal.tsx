"use client";

import { changeDefuntStatut } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, RotateCcw, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";

function formatApiError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const parts: string[] = [];
    for (const v of Object.values(err as Record<string, unknown>)) {
      if (Array.isArray(v)) parts.push(...v.map(String));
      else if (typeof v === "string") parts.push(v);
    }
    if (parts.length) return parts.join(" ");
  }
  return "Données invalides ou erreur serveur.";
}

export interface ChangeStatutModalHandle {
  open: (defunt: { id: string; nom: string; prenom?: string; statut: string }) => void;
}

interface ChangeStatutModalProps {
  onSuccess?: () => void;
}

type SelectedDefunt = {
  id: string;
  nom: string;
  prenom?: string;
  statut: string;
};

const ChangeStatutModal = forwardRef<ChangeStatutModalHandle, ChangeStatutModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [selectedDefunt, setSelectedDefunt] = useState<SelectedDefunt | null>(null);
    const [loading, setLoading] = useState(false);

    const close = () => {
      dialogRef.current?.close();
      setLoading(false);
      setSelectedDefunt(null);
    };

    useImperativeHandle(ref, () => ({
      open: (defunt) => {
        setSelectedDefunt({
          id: String(defunt.id),
          nom: defunt.nom,
          prenom: defunt.prenom,
          statut: defunt.statut,
        });
        dialogRef.current?.showModal();
      },
    }));

    const handleConfirm = async () => {
      if (!selectedDefunt) return;

      setLoading(true);

      try {
        const res = await changeDefuntStatut({ id: selectedDefunt.id });

        if (res == null) {
          toast.error("Session expirée ou accès refusé.");
          return;
        }
        if (res && typeof res === "object" && "error" in res && res.error) {
          toast.error(formatApiError(res.error));
          return;
        }

        const message =
          res && typeof res === "object" && "message" in res && typeof res.message === "string"
            ? res.message
            : "Statut changé avec succès.";
        toast.success(message);
        close();
        onSuccess?.();
      } catch {
        toast.error("Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    // Vérifier si le défunt peut changer de statut (doit être "Inhumé")
    const canChangeStatut = selectedDefunt?.statut === "Inhumé";

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/15 text-warning">
                <RotateCcw size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Changer le statut du défunt
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Passer de "Inhumé" à "Incinéré"
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="btn btn-ghost btn-sm btn-square text-white/30 hover:text-white/70"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-warning">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                {canChangeStatut ? (
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">
                      Confirmer le changement de statut pour « {selectedDefunt?.nom} {selectedDefunt?.prenom || ''} » ?
                    </p>
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Statut actuel :</span>
                        <span className="badge badge-warning badge-xs">Inhumé</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-white/60">Nouveau statut :</span>
                        <span className="badge badge-success badge-xs">Incinéré</span>
                      </div>
                      <div className="text-xs text-warning/80 mt-2 pt-2 border-t border-warning/20">
                        <strong>Attention :</strong> La place sera libérée (mise à None).
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">
                      Le changement de statut n'est pas possible pour « {selectedDefunt?.nom} {selectedDefunt?.prenom || ''} ».
                    </p>
                    <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Statut actuel :</span>
                        <span className="badge badge-neutral badge-xs">{selectedDefunt?.statut || 'Inconnu'}</span>
                      </div>
                      <div className="text-xs text-error/80 mt-2 pt-2 border-t border-error/20">
                        Seuls les défunts avec le statut "Inhumé" peuvent être changés en "Incinéré".
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={loading}
              className="btn btn-ghost btn-sm text-white/50 hover:text-white/80"
            >
              Annuler
            </button>

            {canChangeStatut && (
              <motion.button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="btn btn-warning btn-sm gap-2 min-w-28"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Changement...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Changer statut
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Backdrop cliquable */}
        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

ChangeStatutModal.displayName = "ChangeStatutModal";
export default ChangeStatutModal;
