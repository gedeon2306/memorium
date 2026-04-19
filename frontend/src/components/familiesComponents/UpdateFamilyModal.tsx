"use client";

import { updateFamily } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { SquarePen, X, Loader2 } from "lucide-react";
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

export interface UpdateFamilyModalHandle {
  open: (famille: {
    id: string;
    nom_famille: string;
    nom_garrant: string;
    profession: string;
    telephone: string;
    email: string;
  }) => void;
}

interface UpdateFamilyModalProps {
  onSuccess?: () => void;
}

type SelectedFamille = {
  id: string;
  nom_famille: string;
  nom_garrant: string;
  profession: string;
  telephone: string;
  email: string;
};

const UpdateFamilyModal = forwardRef<UpdateFamilyModalHandle, UpdateFamilyModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [selected, setSelected] = useState<SelectedFamille | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const close = () => {
      dialogRef.current?.close();
      formRef.current?.reset();
      setErrors({});
      setLoading(false);
      setSelected(null);
    };

    useImperativeHandle(ref, () => ({
      open: (famille) => {
        setErrors({});
        const normalized: SelectedFamille = {
          id: String(famille.id),
          nom_famille: famille.nom_famille ?? "",
          nom_garrant: famille.nom_garrant ?? "",
          profession: famille.profession ?? "",
          telephone: famille.telephone ?? "",
          email: famille.email ?? "",
        };
        setSelected(normalized);

        if (formRef.current) {
          formRef.current.reset();

          const nomFamille = formRef.current.elements.namedItem(
            "nom_famille"
          ) as HTMLInputElement | null;
          const nomGarrant = formRef.current.elements.namedItem(
            "nom_garrant"
          ) as HTMLInputElement | null;
          const profession = formRef.current.elements.namedItem(
            "profession"
          ) as HTMLInputElement | null;
          const telephone = formRef.current.elements.namedItem(
            "telephone"
          ) as HTMLInputElement | null;
          const email = formRef.current.elements.namedItem("email") as HTMLInputElement | null;

          if (nomFamille) nomFamille.value = normalized.nom_famille;
          if (nomGarrant) nomGarrant.value = normalized.nom_garrant;
          if (profession) profession.value = normalized.profession;
          if (telephone) telephone.value = normalized.telephone;
          if (email) email.value = normalized.email;
        }

        dialogRef.current?.showModal();
      },
    }));

    const validate = (data: FormData): Record<string, string> => {
      const errs: Record<string, string> = {};
      const nom_famille = (data.get("nom_famille") as string)?.trim();
      const nom_garrant = (data.get("nom_garrant") as string)?.trim();
      const profession = (data.get("profession") as string)?.trim();
      const telephone = (data.get("telephone") as string)?.trim();
      const email = (data.get("email") as string)?.trim();

      if (!nom_famille) errs.nom_famille = "Le nom de famille est requis.";
      if (!nom_garrant) errs.nom_garrant = "Le nom du garant est requis.";
      if (!profession) errs.profession = "La profession est requise.";
      if (!telephone) errs.telephone = "Le téléphone est requis.";
      if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = "E-mail invalide.";
      if (profession && profession.length > 50) errs.profession = "Maximum 50 caractères.";

      return errs;
    };

    const handleSubmit = async () => {
      if (!formRef.current || !selected) return;

      const data = new FormData(formRef.current);
      const errs = validate(data);
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        const payload = {
          id: selected.id,
          nom_famille: (data.get("nom_famille") as string).trim(),
          nom_garrant: (data.get("nom_garrant") as string).trim(),
          profession: (data.get("profession") as string).trim(),
          telephone: (data.get("telephone") as string).trim(),
          email: (data.get("email") as string).trim(),
        };

        const res = await updateFamily(payload);

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
            : "Famille mise à jour.";
        toast.success(message);
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
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-lg w-full max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
                <SquarePen size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-base leading-tight">
                  Modifier une famille
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Mettre à jour les informations enregistrées
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
                  Nom de famille <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="nom_famille"
                  placeholder="ex : Martin"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.nom_famille ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, nom_famille: "" }))}
                />
                {errors.nom_famille && (
                  <p className="text-xs text-error/80">{errors.nom_famille}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Nom du garant <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="nom_garrant"
                  placeholder="ex : Jean Martin"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.nom_garrant ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, nom_garrant: "" }))}
                />
                {errors.nom_garrant && (
                  <p className="text-xs text-error/80">{errors.nom_garrant}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Profession <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="profession"
                  placeholder="ex : Commerçant"
                  maxLength={50}
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.profession ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, profession: "" }))}
                />
                {errors.profession && (
                  <p className="text-xs text-error/80">{errors.profession}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Téléphone <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  placeholder="ex : 06 12 34 56 78"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.telephone ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, telephone: "" }))}
                />
                {errors.telephone && (
                  <p className="text-xs text-error/80">{errors.telephone}</p>
                )}
              </div>

              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Adresse e-mail <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ex : contact@exemple.com"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.email ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, email: "" }))}
                />
                {errors.email && <p className="text-xs text-error/80">{errors.email}</p>}
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
                    Mise à jour…
                  </>
                ) : (
                  <>
                    <SquarePen size={14} />
                    Enregistrer
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

UpdateFamilyModal.displayName = "UpdateFamilyModal";
export default UpdateFamilyModal;
