"use client";

import { deleteFamily } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface DeleteFamilyModalHandle {
  open: (famille: { id: string; nom_famille?: string }) => void;
}

interface DeleteFamilyModalProps {
  onSuccess?: () => void;
}

type SelectedFamille = {
  id: string;
  nom_famille?: string;
};

const DeleteFamilyModal = forwardRef<DeleteFamilyModalHandle, DeleteFamilyModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [selected, setSelected] = useState<SelectedFamille | null>(null);
    const [loading, setLoading] = useState(false);

    const close = () => {
      dialogRef.current?.close();
      setLoading(false);
      setSelected(null);
    };

    useImperativeHandle(ref, () => ({
      open: (famille) => {
        setSelected({
          id: String(famille.id),
          nom_famille: famille.nom_famille,
        });
        dialogRef.current?.showModal();
      },
    }));

    const handleConfirm = async () => {
      if (!selected) return;

      setLoading(true);

      try {
        const result = await deleteFamily({ id: selected.id });

        if (result == null) {
          toast.error("Session expirée ou accès refusé.");
          return;
        }

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(result.message ?? "Famille supprimée.");
        close();
        onSuccess?.();
      } catch {
        toast.error("Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-lg w-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/15 text-error">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Supprimer une famille
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Cette action est irréversible.
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

          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-error">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-sm text-white/70">
                  {selected?.nom_famille
                    ? `Confirmer la suppression de la famille « ${selected.nom_famille} ».`
                    : "Confirmer la suppression de cette famille."}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3">
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
              onClick={handleConfirm}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="btn btn-error btn-sm gap-2 min-w-28"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Suppression…
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

        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

DeleteFamilyModal.displayName = "DeleteFamilyModal";
export default DeleteFamilyModal;
