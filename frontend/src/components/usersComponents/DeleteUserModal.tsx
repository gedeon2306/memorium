"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";

import { deleteUser } from "@/app/actions/actions";

export interface DeleteUserModalHandle {
  open: (user: { id: string | number; name?: string }) => void;
}

interface DeleteUserModalProps {
  onSuccess?: () => void;
}

type SelectedUser = {
  id: string;
  name?: string;
};

const DeleteUserModal = forwardRef<DeleteUserModalHandle, DeleteUserModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [loading, setLoading] = useState(false);

    const close = () => {
      dialogRef.current?.close();
      setLoading(false);
      setSelectedUser(null);
    };

    useImperativeHandle(ref, () => ({
      open: (user) => {
        setSelectedUser({
          id: String(user.id),
          name: user.name,
        });
        dialogRef.current?.showModal();
      },
    }));

    const handleConfirm = async () => {
      if (!selectedUser) return;

      setLoading(true);

      try {
        const result = await deleteUser({ id: selectedUser.id });

        if (result == null) {
          toast.error("Session expirée ou accès refusé.");
          return;
        }

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        toast.success(result.message ?? "Utilisateur supprimé.");
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-error/15 text-error">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Supprimer un utilisateur
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

          {/* Body */}
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-error">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-sm text-white/70">
                  {selectedUser?.name
                    ? `Confirmer la suppression de « ${selectedUser.name} ».`
                    : "Confirmer la suppression de cet utilisateur."}
                </p>
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

        {/* Backdrop cliquable */}
        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

DeleteUserModal.displayName = "DeleteUserModal";
export default DeleteUserModal;

