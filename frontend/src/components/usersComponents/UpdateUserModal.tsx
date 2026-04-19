"use client";

import { motion } from "framer-motion";
import { UserRoundCog, X, Loader2 } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import toast from "react-hot-toast";

import { updateUser } from "@/app/actions/actions";

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

const ROLES = [
  { value: "Administrateur", label: "Administrateur" },
  { value: "Assistant", label: "Assistant" },
  { value: "Testeur", label: "Testeur" },
];

export interface UpdateUserModalHandle {
  open: (user: {
    id: string | number;
    name: string;
    email: string;
    role: string;
  }) => void;
}

interface UpdateUserModalProps {
  onSuccess?: () => void;
}

type SelectedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const UpdateUserModal = forwardRef<UpdateUserModalHandle, UpdateUserModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const close = () => {
      dialogRef.current?.close();
      formRef.current?.reset();
      setErrors({});
      setLoading(false);
      setSelectedUser(null);
    };

    useImperativeHandle(ref, () => ({
      open: (user) => {
        setErrors({});
        const normalized: SelectedUser = {
          id: String(user.id),
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "",
        };
        setSelectedUser(normalized);

        // Remplissage direct des champs (inputs non contrôlés comme AddUserModal)
        if (formRef.current) {
          formRef.current.reset();

          const nameInput = formRef.current.elements.namedItem("name") as HTMLInputElement | null;
          const emailInput = formRef.current.elements.namedItem("email") as HTMLInputElement | null;
          const roleSelect = formRef.current.elements.namedItem("role") as HTMLSelectElement | null;

          if (nameInput) nameInput.value = normalized.name;
          if (emailInput) emailInput.value = normalized.email;
          if (roleSelect) roleSelect.value = normalized.role;
        }

        dialogRef.current?.showModal();
      },
    }));

    const validate = (data: FormData): Record<string, string> => {
      const errs: Record<string, string> = {};
      const name = (data.get("name") as string)?.trim();
      const email = (data.get("email") as string)?.trim();
      const role = data.get("role") as string;

      if (!name) errs.name = "Le nom est requis.";
      if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = "E-mail invalide.";
      if (!role) errs.role = "Veuillez choisir un rôle.";

      return errs;
    };

    const handleSubmit = async () => {
      if (!formRef.current || !selectedUser) return;

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
          id: selectedUser.id,
          name: (data.get("name") as string).trim(),
          email: (data.get("email") as string).trim(),
          role: data.get("role") as string,
        };

        const res = await updateUser(payload);

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
            : "Utilisateur mis à jour.";
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
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-lg w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15 text-primary">
                <UserRoundCog size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Modifier un utilisateur
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Mettre à jour les informations du compte
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

          {/* Formulaire */}
          <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate>
            <div className="px-6 py-5 space-y-4">
              {/* Nom */}
              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Nom complet <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="ex : Marie Dupont"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.name ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, name: "" }))}
                />
                {errors.name && <p className="text-xs text-error/80">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Adresse e-mail <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ex : marie@exemple.com"
                  className={`input input-sm w-full bg-white/5 border text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.email ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, email: "" }))}
                />
                {errors.email && <p className="text-xs text-error/80">{errors.email}</p>}
              </div>

              {/* Rôle */}
              <div className="form-control gap-1.5">
                <label className="text-xs font-medium text-white/55 uppercase tracking-wider">
                  Rôle <span className="text-error">*</span>
                </label>
                <select
                  name="role"
                  defaultValue=""
                  className={`select select-sm w-full bg-white/5 border text-white focus:outline-none focus:border-primary/60 transition-colors ${
                    errors.role ? "border-error/60" : "border-white/10"
                  }`}
                  onChange={() => setErrors((e) => ({ ...e, role: "" }))}
                >
                  <option value="" disabled>
                    Sélectionner un rôle…
                  </option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-xs text-error/80">{errors.role}</p>}
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
                    <UserRoundCog size={14} />
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

UpdateUserModal.displayName = "UpdateUserModal";
export default UpdateUserModal;

