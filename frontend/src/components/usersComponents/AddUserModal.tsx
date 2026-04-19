"use client";

import { createUser } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { UserPlus, X, Loader2 } from "lucide-react";
import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import toast from "react-hot-toast";

const ROLES = [
  { value: "Administrateur", label: "Administrateur" },
  { value: "Assistant", label: "Assistant" },
  { value: "Testeur", label: "Testeur" },
];

interface AddUserModalProps {
  onSuccess?: () => void;
}

export interface AddUserModalHandle {
  open: () => void;
}

const AddUserModal = forwardRef<AddUserModalHandle, AddUserModalProps>(
  ({ onSuccess }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef   = useRef<HTMLFormElement>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors]   = useState<Record<string, string>>({});

    useImperativeHandle(ref, () => ({
      open: () => {
        setErrors({});
        formRef.current?.reset();
        dialogRef.current?.showModal();
      },
    }));

    const close = () => {
      dialogRef.current?.close();
      formRef.current?.reset();
      setErrors({});
    };

    const validate = (data: FormData): Record<string, string> => {
      const errs: Record<string, string> = {};
      const name  = (data.get("name") as string)?.trim();
      const email = (data.get("email") as string)?.trim();
      const role  = data.get("role") as string;

      if (!name) errs.name  = "Le nom est requis.";
      if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = "E-mail invalide.";
      if (!role) errs.role  = "Veuillez choisir un rôle.";

      return errs;
    };

    const handleSubmit = async () => {
      if (!formRef.current) return;

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
          name:  (data.get("name") as string).trim(),
          email: (data.get("email") as string).trim(),
          role:  data.get("role") as string,
        };

        const res = await createUser(payload);

        if (res?.error) {
          console.log(res)
          toast.error(res.error);
          return;
        }

        toast.success(res.message);
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
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Ajouter un utilisateur
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Créer un nouveau compte dans Memorium
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
                {errors.name && (
                  <p className="text-xs text-error/80">{errors.name}</p>
                )}
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
                {errors.email && (
                  <p className="text-xs text-error/80">{errors.email}</p>
                )}
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
                {errors.role && (
                  <p className="text-xs text-error/80">{errors.role}</p>
                )}
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
                    Création…
                  </>
                ) : (
                  <>
                    <UserPlus size={14} />
                    Créer
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

AddUserModal.displayName = "AddUserModal";
export default AddUserModal;