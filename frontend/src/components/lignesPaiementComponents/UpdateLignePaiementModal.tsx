"use client";

import { updateLignePaiement } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { CreditCard, X, Loader2, SquarePen } from "lucide-react";
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

const MOYENS_PAIEMENT = [
  { value: "cash", label: "Espèces" },
  { value: "carte", label: "Carte bancaire" },
  { value: "virement", label: "Virement bancaire" },
  { value: "mobile", label: "Mobile Money" },
  { value: "cheque", label: "Chèque" },
];

const MOTIFS = [
  { value: "Inhumation", label: "Inhumation" },
  { value: "Incinération", label: "Incinération" },
  { value: "Frais administratifs", label: "Frais administratifs" },
  { value: "Service funéraire", label: "Service funéraire" },
  { value: "Transport", label: "Transport" },
  { value: "Autre", label: "Autre" },
];

interface UpdateLignePaiementModalProps {
  onSuccess?: () => void;
  defunts?: any[];
}

export interface UpdateLignePaiementModalHandle {
  open: (ligne: any) => void;
}

const UpdateLignePaiementModal = forwardRef<UpdateLignePaiementModalHandle, UpdateLignePaiementModalProps>(
  ({ onSuccess, defunts = [] }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentLigne, setCurrentLigne] = useState<any>(null);
    const [formData, setFormData] = useState({
      motif: "Inhumation",
      montant: "",
      moyen_paiement: "cash",
      defunt: "",
    });

    useImperativeHandle(ref, () => ({
      open: (ligne) => {
        setCurrentLigne(ligne);
        setFormData({
          motif: ligne.motif || "Inhumation",
          montant: ligne.montant || "",
          moyen_paiement: ligne.moyen_paiement || "cash",
          defunt: ligne.defunt || "",
        });
        setErrors({});
        dialogRef.current?.showModal();
      },
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentLigne) return;

      setLoading(true);
      setErrors({});

      try {
        const payload = {
          id: currentLigne.id,
          motif: formData.motif,
          montant: formData.montant,
          moyen_paiement: formData.moyen_paiement,
          defunt: formData.defunt || undefined,
        };

        const res = await updateLignePaiement(payload);

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
            : "Ligne de paiement modifiée avec succès.";
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
      setCurrentLigne(null);
    };

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-lg w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
                <SquarePen size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-base leading-tight">
                  Modifier une ligne de paiement
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Mettre à jour une ligne de paiement dans Memorium
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              className="btn btn-ghost btn-sm btn-square text-white/30 hover:text-white/70 shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col min-h-0 flex-1">
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Motif <span className="text-error">*</span>
                </label>
                <select
                  value={formData.motif}
                  onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                  className={`select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.motif ? "border-error/60" : "border-white/10"
                  }`}
                  required
                >
                  {MOTIFS.map((motif) => (
                    <option key={motif.value} value={motif.value}>
                      {motif.label}
                    </option>
                  ))}
                </select>
                {errors.motif && (
                  <p className="text-xs text-error/80">{errors.motif}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Montant (XAF) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.montant}
                  onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.montant ? "border-error/60" : "border-white/10"
                  }`}
                  placeholder="0.00"
                  required
                />
                {errors.montant && (
                  <p className="text-xs text-error/80">{errors.montant}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Moyen de paiement <span className="text-error">*</span>
                </label>
                <select
                  value={formData.moyen_paiement}
                  onChange={(e) => setFormData({ ...formData, moyen_paiement: e.target.value })}
                  className={`select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.moyen_paiement ? "border-error/60" : "border-white/10"
                  }`}
                  required
                >
                  {MOYENS_PAIEMENT.map((moyen) => (
                    <option key={moyen.value} value={moyen.value}>
                      {moyen.label}
                    </option>
                  ))}
                </select>
                {errors.moyen_paiement && (
                  <p className="text-xs text-error/80">{errors.moyen_paiement}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Défunt
                </label>
                <select
                  value={formData.defunt}
                  onChange={(e) => setFormData({ ...formData, defunt: e.target.value })}
                  className="select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors border-white/10"
                >
                  <option value="">Sélectionner un défunt</option>
                  {defunts.map((defunt) => (
                    <option key={defunt.id} value={defunt.id}>
                      {defunt.nom} {defunt.prenom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3 shrink-0">
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
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="btn btn-primary btn-sm gap-2 min-w-28"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Modification…
                  </>
                ) : (
                  <>
                    <SquarePen size={14} />
                    Modifier
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

UpdateLignePaiementModal.displayName = "UpdateLignePaiementModal";

export default UpdateLignePaiementModal;
