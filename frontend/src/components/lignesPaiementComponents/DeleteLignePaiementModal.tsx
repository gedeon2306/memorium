"use client";

import { deleteLignePaiement } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { Trash2, X, Loader2, AlertTriangle } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";

interface DeleteLignePaiementModalProps {
  onSuccess?: () => void;
}

export interface DeleteLignePaiementModalHandle {
  open: (ligne: any) => void;
}

const DeleteLignePaiementModal = forwardRef<DeleteLignePaiementModalHandle, DeleteLignePaiementModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [loading, setLoading] = useState(false);
    const [currentLigne, setCurrentLigne] = useState<any>(null);

    useImperativeHandle(ref, () => ({
      open: (ligne: any) => {
        setCurrentLigne(ligne);
        dialogRef.current?.showModal();
      },
    }));

    const handleDelete = async () => {
      if (!currentLigne) return;

      setLoading(true);

      try {
        const result = await deleteLignePaiement({ id: currentLigne.id });

        if (result == null) {
          toast.error("Session expirée ou accès refusé.");
          return;
        }

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(result.message ?? "Ligne de paiement supprimée.");
        close();
        onSuccess?.();
      } catch {
        toast.error("Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    const close = () => {
      dialogRef.current?.close();
      setLoading(false);
      setCurrentLigne(null);
    };

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/15 text-error">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Supprimer une ligne de paiement
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Cette action est irréversible
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
            {currentLigne && (
              <div className="space-y-4">
                {/* Avertissement */}
                <div className="alert alert-warning">
                  <AlertTriangle size={16} />
                  <div>
                    <h4 className="font-semibold">Attention</h4>
                    <p className="text-sm">
                      Vous êtes sur le point de supprimer la ligne de paiement suivante :
                    </p>
                  </div>
                </div>

                {/* Détails de la ligne */}
                <div className="bg-white/2 border border-white/10 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Motif :</span>
                      <span className="text-white font-medium">{currentLigne.motif}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Montant :</span>
                      <span className="text-white font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XAF'
                        }).format(parseFloat(currentLigne.montant))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Moyen paiement :</span>
                      <span className="text-white font-medium">{currentLigne.moyen_paiement}</span>
                    </div>
                    {currentLigne.defunt_nom && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Défunt :</span>
                        <span className="text-white font-medium">{currentLigne.defunt_nom}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">Facture :</span>
                      <span className="text-white font-medium">{currentLigne.paiement_num_facture}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8">
                  <button
                    type="button"
                    onClick={close}
                    disabled={loading}
                    className="btn btn-ghost btn-sm text-white/50 hover:text-white/80"
                  >
                    Annuler
                  </button>

                  <motion.button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="btn btn-error btn-sm gap-2 min-w-28"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Supprimer
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
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

DeleteLignePaiementModal.displayName = "DeleteLignePaiementModal";
export default DeleteLignePaiementModal;
