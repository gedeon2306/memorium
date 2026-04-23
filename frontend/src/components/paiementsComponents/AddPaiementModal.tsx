"use client";

import { createPaiement } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { CreditCard, X, Loader2, Plus, Trash2 } from "lucide-react";
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
  { value: "Espèces", label: "Espèces" },
  { value: "Carte bancaire", label: "Carte bancaire" },
  { value: "Virement bancaire", label: "Virement bancaire" },
  { value: "Mobile money", label: "Mobile money" },
  { value: "Chèque", label: "Chèque" },
];

const MOTIFS = [
  { value: "Inhumation", label: "Inhumation" },
  { value: "Incinération", label: "Incinération" },
  { value: "Frais administratifs", label: "Frais administratifs" },
  { value: "Service funéraire", label: "Service funéraire" },
  { value: "Transport", label: "Transport" },
  { value: "Autre", label: "Autre" },
];

interface AddPaiementModalProps {
  onSuccess?: () => void;
  families?: any[];
  defunts?: any[];
}

export interface AddPaiementModalHandle {
  open: () => void;
}

const AddPaiementModal = forwardRef<AddPaiementModalHandle, AddPaiementModalProps>(
  ({ onSuccess, families = [], defunts = [] }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lignes, setLignes] = useState<Array<{
      id: string;
      motif: string;
      montant: string;
      moyen_paiement: string;
      defunt?: string;
    }>>([
      {
        id: crypto.randomUUID(),
        motif: "Inhumation",
        montant: "",
        moyen_paiement: "Espèces",
        defunt: "",
      },
    ]);

    const calculateTotal = () => {
      return lignes.reduce((total, ligne) => {
        const montant = parseFloat(ligne.montant) || 0;
        return total + montant;
      }, 0).toFixed(2);
    };

    const addLigne = () => {
      setLignes([
        ...lignes,
        {
          id: crypto.randomUUID(),
          motif: "Inhumation",
          montant: "",
          moyen_paiement: "Espèces",
          defunt: "",
        },
      ]);
    };

    const removeLigne = (id: string) => {
      if (lignes.length > 1) {
        setLignes(lignes.filter(ligne => ligne.id !== id));
      } else {
        toast.error("Un paiement doit avoir au moins une ligne");
      }
    };

    const updateLigne = (id: string, field: string, value: string) => {
      setLignes(lignes.map(ligne =>
        ligne.id === id ? { ...ligne, [field]: value } : ligne
      ));
    };

    useImperativeHandle(ref, () => ({
      open: () => {
        setErrors({});
        setLignes([
          {
            id: crypto.randomUUID(),
            motif: "Inhumation",
            montant: "",
            moyen_paiement: "Espèces",
            defunt: "",
          },
        ]);
        formRef.current?.reset();
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

        const lignesValid = lignes.every(ligne => {
          return ligne.montant && parseFloat(ligne.montant) > 0 && ligne.motif && ligne.moyen_paiement;
        });

        if (!lignesValid) {
          setErrors({ lignes: "Toutes les lignes doivent avoir un montant, un motif et un moyen de paiement valides" });
          setLoading(false);
          return;
        }

        const payload = {
          famille,
          total_amount: calculateTotal(),
          lignes: lignes.map(ligne => ({
            motif: ligne.motif,
            montant: ligne.montant,
            moyen_paiement: ligne.moyen_paiement,
            defunt: ligne.defunt || undefined,
          })),
        };

        const res = await createPaiement(payload);

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
            : "Paiement créé avec succès.";
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
    };

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15 text-primary">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Ajouter un paiement
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Créer un nouveau paiement avec ses lignes
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
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Famille */}
              <div className="flex flex-col gap-1.5">
                <span className="text-white/80 text-sm">Famille *</span>
                <select
                  name="famille"
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

              {/* Lignes de paiement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">Lignes de paiement *</span>
                  <button
                    type="button"
                    onClick={addLigne}
                    className="btn btn-primary btn-xs gap-1"
                  >
                    <Plus size={12} />
                    Ajouter une ligne
                  </button>
                </div>

                {errors.lignes && (
                  <div className="alert alert-error alert-sm">
                    <span>{errors.lignes}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {lignes.map((ligne, index) => (
                    <div key={ligne.id} className="border border-white/10 rounded-lg p-4 bg-white/2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">Ligne {index + 1}</h4>
                        {lignes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLigne(ligne.id)}
                            className="btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Motif */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white/60 text-xs">Motif *</span>
                          <select
                            value={ligne.motif}
                            onChange={(e) => updateLigne(ligne.id, "motif", e.target.value)}
                            className="select select-bordered select-sm bg-white/5 border-white/10 text-white focus:border-primary/50"
                            required
                          >
                            {MOTIFS.map((motif) => (
                              <option key={motif.value} value={motif.value}>
                                {motif.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Montant */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white/60 text-xs">Montant (XAF) *</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ligne.montant}
                            onChange={(e) => updateLigne(ligne.id, "montant", e.target.value)}
                            className="input input-bordered input-sm bg-white/5 border-white/10 text-white focus:border-primary/50"
                            placeholder="0.00"
                            required
                          />
                        </div>

                        {/* Moyen de paiement */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white/60 text-xs">Moyen paiement *</span>
                          <select
                            value={ligne.moyen_paiement}
                            onChange={(e) => updateLigne(ligne.id, "moyen_paiement", e.target.value)}
                            className="select select-bordered select-sm bg-white/5 border-white/10 text-white focus:border-primary/50"
                            required
                          >
                            {MOYENS_PAIEMENT.map((moyen) => (
                              <option key={moyen.value} value={moyen.value}>
                                {moyen.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Défunt (optionnel) */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-white/60 text-xs">Défunt (optionnel)</span>
                          <select
                            value={ligne.defunt || ""}
                            onChange={(e) => updateLigne(ligne.id, "defunt", e.target.value)}
                            className="select select-bordered select-sm bg-white/5 border-white/10 text-white focus:border-primary/50"
                          >
                            <option value="">Aucun</option>
                            {defunts.map((defunt) => (
                              <option key={defunt.id} value={defunt.id}>
                                {defunt.nom} {defunt.prenom || ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80 font-medium">Montant total :</span>
                  <span className="text-xl font-bold text-primary">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'XAF'
                    }).format(parseFloat(calculateTotal()))}
                  </span>
                </div>
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
                      Création...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Créer le paiement
                    </>
                  )}
                </motion.button>
              </div>
            </form>
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

AddPaiementModal.displayName = "AddPaiementModal";
export default AddPaiementModal;