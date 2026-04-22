"use client";

import { updateDefunt } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { SquarePen, X, Loader2, Calendar, User } from "lucide-react";
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

const GENRES = [
  { value: "M", label: "Masculin" },
  { value: "F", label: "Féminin" },
];

export interface UpdateDefuntModalHandle {
  open: (defunt: {
    id: string;
    nom: string;
    prenom?: string;
    genre: string;
    age: number;
    profession?: string;
    date_naiss: string;
    date_deces: string;
    place?: number;
    date_inhumation: string;
    date_incineration: string;
    statut?: string;
    famille?: string;
    photo?: string;
  }) => void;
}

interface UpdateDefuntModalProps {
  onSuccess?: () => void;
  families?: any[];
}

type SelectedDefunt = {
  id: string;
  nom: string;
  prenom?: string;
  genre: string;
  age: number;
  profession?: string;
  date_naiss: string;
  date_deces: string;
  place?: number;
  date_inhumation: string;
  date_incineration: string;
  statut?: string;
  famille?: string;
  photo?: string;
};

const UpdateDefuntModal = forwardRef<UpdateDefuntModalHandle, UpdateDefuntModalProps>(
  ({ onSuccess, families = [] }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [selectedDefunt, setSelectedDefunt] = useState<SelectedDefunt | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const close = () => {
      dialogRef.current?.close();
      formRef.current?.reset();
      setErrors({});
      setLoading(false);
      setSelectedDefunt(null);
    };

    useImperativeHandle(ref, () => ({
      open: (defunt) => {
        setErrors({});
        const normalized: SelectedDefunt = {
          id: String(defunt.id),
          nom: defunt.nom ?? "",
          prenom: defunt.prenom ?? "",
          genre: defunt.genre ?? "",
          age: defunt.age ?? 0,
          profession: defunt.profession ?? "",
          date_naiss: defunt.date_naiss ?? "",
          date_deces: defunt.date_deces ?? "",
          place: defunt.place,
          date_inhumation: defunt.date_inhumation ?? "",
          date_incineration: defunt.date_incineration ?? "",
          statut: defunt.statut ?? "",
          famille: defunt.famille ?? "",
          photo: defunt.photo ?? "",
        };
        setSelectedDefunt(normalized);

        // Remplissage direct des champs
        if (formRef.current) {
          formRef.current.reset();

          const nomInput = formRef.current.elements.namedItem("nom") as HTMLInputElement | null;
          const prenomInput = formRef.current.elements.namedItem("prenom") as HTMLInputElement | null;
          const genreSelect = formRef.current.elements.namedItem("genre") as HTMLSelectElement | null;
          const ageInput = formRef.current.elements.namedItem("age") as HTMLInputElement | null;
          const professionInput = formRef.current.elements.namedItem("profession") as HTMLInputElement | null;
          const dateNaissInput = formRef.current.elements.namedItem("date_naiss") as HTMLInputElement | null;
          const dateDecesInput = formRef.current.elements.namedItem("date_deces") as HTMLInputElement | null;
          const dateInhumationInput = formRef.current.elements.namedItem("date_inhumation") as HTMLInputElement | null;
          const dateIncinerationInput = formRef.current.elements.namedItem("date_incineration") as HTMLInputElement | null;
          const familleSelect = formRef.current.elements.namedItem("famille") as HTMLSelectElement | null;

          if (nomInput) nomInput.value = normalized.nom;
          if (prenomInput) prenomInput.value = normalized.prenom || "";
          if (genreSelect) genreSelect.value = normalized.genre;
          if (ageInput) ageInput.value = String(normalized.age);
          if (professionInput) professionInput.value = normalized.profession || "";
          if (dateNaissInput) dateNaissInput.value = normalized.date_naiss;
          if (dateDecesInput) dateDecesInput.value = normalized.date_deces;
          if (dateInhumationInput) dateInhumationInput.value = normalized.date_inhumation;
          if (dateIncinerationInput) dateIncinerationInput.value = normalized.date_incineration;
          if (familleSelect) familleSelect.value = normalized.famille || "";
        }

        dialogRef.current?.showModal();
      },
    }));

    const validate = (data: FormData): Record<string, string> => {
      const errs: Record<string, string> = {};
      const nom = (data.get("nom") as string)?.trim();
      const prenom = (data.get("prenom") as string)?.trim();
      const genre = data.get("genre") as string;
      const age = data.get("age") as string;
      const profession = (data.get("profession") as string)?.trim();
      const date_naiss = data.get("date_naiss") as string;
      const date_deces = data.get("date_deces") as string;
      const date_inhumation = data.get("date_inhumation") as string;
      const date_incineration = data.get("date_incineration") as string;
      const famille = (data.get("famille") as string)?.trim();

      if (!nom) errs.nom = "Le nom est requis.";
      if (!genre) errs.genre = "Le genre est requis.";
      if (!age || isNaN(Number(age)) || Number(age) <= 0) errs.age = "L'âge doit être un nombre positif.";
      if (!date_naiss) errs.date_naiss = "La date de naissance est requise.";
      if (!date_deces) errs.date_deces = "La date de décès est requise.";
      if (!date_inhumation) errs.date_inhumation = "La date d'inhumation est requise.";
      if (!date_incineration) errs.date_incineration = "La date d'incinération est requise.";
      
      if (date_naiss && date_deces && new Date(date_naiss) >= new Date(date_deces)) {
        errs.date_naiss = "La date de naissance doit être antérieure à la date de décès.";
      }
      
      if (profession && profession.length > 50) errs.profession = "Maximum 50 caractères.";

      return errs;
    };

    const handleSubmit = async () => {
      if (!formRef.current || !selectedDefunt) return;

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
          id: selectedDefunt.id,
          nom: (data.get("nom") as string).trim(),
          prenom: (data.get("prenom") as string)?.trim() || undefined,
          genre: data.get("genre") as string,
          age: Number(data.get("age")),
          profession: (data.get("profession") as string)?.trim() || undefined,
          date_naiss: data.get("date_naiss") as string,
          date_deces: data.get("date_deces") as string,
          date_inhumation: data.get("date_inhumation") as string,
          date_incineration: data.get("date_incineration") as string,
          famille: (data.get("famille") as string)?.trim() || undefined,
          photo: selectedDefunt.photo, // On ne modifie pas la photo dans ce modal
        };

        const res = await updateDefunt(payload);

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
            : "Défunt mis à jour.";
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
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
                <SquarePen size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-base leading-tight">
                  Modifier un défunt
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Mettre à jour les informations du défunt
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

          {/* Formulaire */}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate className="flex flex-col min-h-0 flex-1">
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Section 1: Informations personnelles */}
              <div className="space-y-4">
                <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">Informations personnelles</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                      Nom <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="nom"
                      placeholder="ex : Dupont"
                      className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.nom ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, nom: "" }))}
                    />
                    {errors.nom && (
                      <p className="text-xs text-error/80">{errors.nom}</p>
                    )}
                  </div>

                  {/* Prénom */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      placeholder="ex : Jean"
                      className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.prenom ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, prenom: "" }))}
                    />
                    {errors.prenom && (
                      <p className="text-xs text-error/80">{errors.prenom}</p>
                    )}
                  </div>

                  {/* Genre */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                      Genre <span className="text-error">*</span>
                    </label>
                    <select
                      name="genre"
                      defaultValue=""
                      className={`select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.genre ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, genre: "" }))}
                    >
                      <option value="" disabled>
                        Sélectionner un genre...
                      </option>
                      {GENRES.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    {errors.genre && (
                      <p className="text-xs text-error/80">{errors.genre}</p>
                    )}
                  </div>

                  {/* Âge */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                      Âge <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      placeholder="ex : 75"
                      min="0"
                      className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.age ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, age: "" }))}
                    />
                    {errors.age && (
                      <p className="text-xs text-error/80">{errors.age}</p>
                    )}
                  </div>

                  {/* Profession */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                      Profession
                    </label>
                    <input
                      type="text"
                      name="profession"
                      placeholder="ex : Retraité"
                      className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.profession ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, profession: "" }))}
                    />
                    {errors.profession && (
                      <p className="text-xs text-error/80">{errors.profession}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Dates importantes */}
              <div className="space-y-4">
                <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">Dates importantes</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={10} />
                      Date de naissance <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_naiss"
                      className={`input input-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.date_naiss ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, date_naiss: "" }))}
                    />
                    {errors.date_naiss && (
                      <p className="text-xs text-error/80">{errors.date_naiss}</p>
                    )}
                  </div>

                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={10} />
                      Date de décès <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_deces"
                      className={`input input-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.date_deces ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, date_deces: "" }))}
                    />
                    {errors.date_deces && (
                      <p className="text-xs text-error/80">{errors.date_deces}</p>
                    )}
                  </div>

                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={10} />
                      Date d'inhumation <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_inhumation"
                      className={`input input-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.date_inhumation ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, date_inhumation: "" }))}
                    />
                    {errors.date_inhumation && (
                      <p className="text-xs text-error/80">{errors.date_inhumation}</p>
                    )}
                  </div>

                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={10} />
                      Date d'incinération <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="date_incineration"
                      className={`input input-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.date_incineration ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, date_incineration: "" }))}
                    />
                    {errors.date_incineration && (
                      <p className="text-xs text-error/80">{errors.date_incineration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Famille */}
              <div className="space-y-4">
                <div className="text-xs font-medium text-white/70 uppercase tracking-wider mb-3">Famille</div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  {/* Famille */}
                  <div className="form-control gap-1.5">
                    <label className="text-xs font-medium text-white/55 uppercase tracking-wider flex items-center gap-1">
                      <User size={10} />
                      Famille
                    </label>
                    <select
                      name="famille"
                      defaultValue=""
                      className={`select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                        errors.famille ? "border-error/60" : "border-white/10"
                      }`}
                      onChange={() => setErrors((e) => ({ ...e, famille: "" }))}
                    >
                      <option value="">
                        Aucune famille
                      </option>
                      {families.map((family: any) => (
                        <option key={family.id} value={family.id}>
                          {family.nom_famille} - {family.nom_garrant}
                        </option>
                      ))}
                    </select>
                    {errors.famille && (
                      <p className="text-xs text-error/80">{errors.famille}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                    Mise à jour...
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

        {/* Backdrop cliquable */}
        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

UpdateDefuntModal.displayName = "UpdateDefuntModal";
export default UpdateDefuntModal;
