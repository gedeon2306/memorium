"use client";

import { updatePaiement } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { CreditCard, X, Loader2, Save } from "lucide-react";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
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

interface UpdatePaiementModalProps {
  onSuccess?: () => void;
  families?: any[];
}

export interface UpdatePaiementModalHandle {
  open: (paiement: any) => void;
}

const UpdatePaiementModal = forwardRef<UpdatePaiementModalHandle, UpdatePaiementModalProps>(
  ({ onSuccess, families = [] }, ref) => {
    console.log("UpdatePaiementModal - families reçues:", families);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentPaiement, setCurrentPaiement] = useState<any>(null);

    useImperativeHandle(ref, () => ({
      open: (paiement: any) => {
        setCurrentPaiement(paiement);
        setErrors({});
        formRef.current?.reset();

        setTimeout(() => {
          const familleSelect = formRef.current?.elements.namedItem("famille") as HTMLSelectElement | null;
          if (familleSelect) {
            familleSelect.value = paiement.famille || paiement.famille_details?.id || "";
          }
        }, 0);

        dialogRef.current?.showModal();
      },
    }));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setErrors({});

      try {
        const formData = new FormData(e.currentTarget);

        const famille = formData.get("famille") as string;

        if (!famille) {
          setErrors({ famille: "La famille est requise" });
          setLoading(false);
          return;
        }

        const payload = {
          id: currentPaiement.id,
          famille,
        };

        const res = await updatePaiement(payload);

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
            : "Paiement modifié avec succès.";
        toast.success(message);
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
      setErrors({});
      setCurrentPaiement(null);
    };

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15 text-primary">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Modifier un paiement
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Mettre à jour les informations du paiement
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
            {currentPaiement && (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* Informations du paiement */}
                <div className="bg-white/2 border border-white/10 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-white mb-3">Informations actuelles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Numéro facture :</span>
                      <p className="text-white font-medium">{currentPaiement.num_facture}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Date paiement :</span>
                      <p className="text-white font-medium">
                        {new Date(currentPaiement.date_paiement).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/60">Montant total :</span>
                      <p className="text-white font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XAF'
                        }).format(parseFloat(currentPaiement.total_amount))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Famille */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-white/80 text-sm">Famille *</span>
                  <select
                    name="famille"
                    defaultValue=""
                    className="select select-bordered bg-white/5 border-white/10 text-white focus:border-primary/50"
                    required
                  >
                    <option value="">Sélectionner une famille</option>
                    {families.map((famille) => (
                      <option key={famille.id} value={famille.id}>
                        {famille.nom_famille}
                      </option>
                    ))}
                  </select>
                  {errors.famille && (
                    <span className="text-error text-xs">{errors.famille}</span>
                  )}
                </div>

                {/* Footer */}
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
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.97 }}
                    className="btn btn-primary btn-sm gap-2 min-w-28"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Modification...
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        Enregistrer
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
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

UpdatePaiementModal.displayName = "UpdatePaiementModal";
export default UpdatePaiementModal;