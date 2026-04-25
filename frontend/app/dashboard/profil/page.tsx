"use client";

import { confirmNewEmail, getUserProfil, updatePassword, updateUserProfil, uploadProfilPhoto } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { User, Camera, ShieldCheck, Key, Save, Pencil, Trash2, MailCheck, X, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilPage() {
  const [userImage, setUserImage] = useState<string>("https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingChangeImage, setLoadingChangeImage] = useState(false);
  const [loadingDeleteImage, setLoadingDeleteImage] = useState(false);
  
  const confirmModalRef = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);


  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const loadProfil = async () => {
    try {
      const res = await getUserProfil();
      setName(res.name)
      setEmail(res.email)
      setRole(res.role)
      if(res.photo){
        setUserImage(res.photo)
      }
    } catch (err) {
      toast.error("Erreur lors du chargement");
    }
  };

  useEffect(() => {
    loadProfil();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(loadingChangeImage || loadingDeleteImage){
      return
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo doit faire moins de 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);

      uploadPhotoToBackend(file);
    }
  };

  const uploadPhotoToBackend = async (file: File) => {
    if(loadingChangeImage || loadingDeleteImage){
      return
    }

    setLoadingChangeImage(true)
    try {
      const result = await uploadProfilPhoto(file);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Photo de profil mise à jour");
      await loadProfil();
    } catch (error: any) {
      console.error("Erreur upload:", error);
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoadingChangeImage(false)
    }
  };

  const handleDeleteImageProfil = async() => {
    if(loadingChangeImage || loadingDeleteImage){
      return
    }

    const data = {
      photo : null,
    }

    const action = "updatePut"

    setLoadingDeleteImage(true)
    try {
      const result = await updateUserProfil(data, action);
      if (result.error) {
        toast.error("Erreur lors de la suppression de l'image");
        return
      } else {
        toast.success("Photo de profil supprimé !");
        setUserImage("https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka")
        await loadProfil();
      }
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoadingDeleteImage(false);
    }
  }

  const handleSaveName = async() => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    
    const data = {
      name : name,
    }

    const action = "updatePut"

    setLoadingName(true)
    try {
      const result = await updateUserProfil(data, action);
      if (result.error) {
        toast.error(result.error);
        return
      } else {
        toast.success(result.data?.message || "Nom mis à jour !");
      }
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsEditingName(false);
      setLoadingName(false)
    }
  };

  const handleSaveEmail = async() => {
    if (!email.includes("@")) {
      toast.error("Email invalide");
      return;
    }

    const data = {
      email : email,
    }

    const action = "updatePost"
    
    setLoadingEmail(true)
    try {
      const result = await updateUserProfil(data, action);
      if (result.error) {
        toast.error(result.error);
        return
      }
      confirmModalRef.current?.showModal();
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsEditingEmail(false);
      setLoadingEmail(false)
    }
    
  };

  const validatePasswordForm = (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    const errs: Record<string, string> = {};

    if (!values.currentPassword) {
      errs.currentPassword = "Le mot de passe actuel est requis.";
    }
    if (!values.newPassword) {
      errs.newPassword = "Le nouveau mot de passe est requis.";
    }
    if (!values.confirmPassword) {
      errs.confirmPassword = "Veuillez confirmer le nouveau mot de passe.";
    }

    if (
      values.currentPassword &&
      values.newPassword &&
      values.currentPassword === values.newPassword
    ) {
      errs.newPassword =
        "Le nouveau mot de passe doit être différent du mot de passe actuel.";
    }

    if (values.newPassword && values.confirmPassword) {
      if (values.newPassword !== values.confirmPassword) {
        errs.confirmPassword = "Les nouveaux mots de passe ne correspondent pas.";
      }
    }

    if (values.newPassword && values.newPassword.length < 8) {
      errs.newPassword = "Le nouveau mot de passe doit faire au moins 8 caractères.";
    }

    return errs;
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const values = {
      currentPassword: (formData.get("currentPassword") as string) || "",
      newPassword: (formData.get("newPassword") as string) || "",
      confirmPassword: (formData.get("confirmPassword") as string) || "",
    };

    const errs = validatePasswordForm(values);
    if (Object.keys(errs).length) {
      setPasswordErrors(errs);
      return;
    }

    setLoading(true);
    setPasswordErrors({});

    try {
      const result = await updatePassword(formData);

      if (result.error) {
        const serverMsg = result.error;

        const nextErrs: Record<string, string> = {};
        let matchedField = false;

        if (/actuel/i.test(serverMsg)) {
          nextErrs.currentPassword = serverMsg;
          matchedField = true;
        } else if (/confirme|confirmation|correspond/i.test(serverMsg)) {
          nextErrs.confirmPassword = serverMsg;
          matchedField = true;
        } else if (/nouveau|mot de passe|8\s*caract|longueur/i.test(serverMsg)) {
          nextErrs.newPassword = serverMsg;
          matchedField = true;
        }

        if (!matchedField) nextErrs.form = serverMsg;

        setPasswordErrors(nextErrs);
        toast.error(serverMsg);
        return;
      }

      toast.success(result.data?.message || "Mot de passe mis à jour !");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedCode = pastedData
      .split("")
      .filter((char) => /^\d$/.test(char));

    if (pastedCode.length <= 6) {
      const newCode = [...code];
      pastedCode.forEach((char, index) => {
          if (index < 6) {
              newCode[index] = char;
          }
      });
      setCode(newCode);

      if (pastedCode.length === 6) {
        inputRefs.current[5]?.blur();
      } else if (pastedCode.length > 0) {
        inputRefs.current[pastedCode.length - 1]?.focus();
      }
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  const handleConfirm = async() => {
    if (!isCodeComplete) return;

    setConfirmLoading(true);
    const codeString = code.join("");

    const data = {
      email: email,
      code: codeString,
    }

    try {
      const result = await confirmNewEmail(data);
      if (result?.error) {
        toast.error(result.error);
        return
      } else {
        toast.success(result?.data?.message || "Email mis à jour !");
      }
      confirmModalRef.current?.close();
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setConfirmLoading(false);
      setCode(["", "", "", "", "", ""])
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <User className="w-8 h-8" />
          Mon Profil
        </h1>
        <p className="mt-2 text-base text-neutral-400">
          Gérez vos informations personnelles et de sécurité.
        </p>
      </motion.div>

      {/* Photo de profil + Role */}
      <motion.div variants={itemVariants} className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
            <img
              src={userImage}
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bouton supprimer photo */}
          <button 
            disabled={userImage == "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka"}
            onClick={handleDeleteImageProfil}
            className="btn btn-secondary absolute top-1 left-0 w-9 h-9 rounded-full flex items-center p-0 justify-center"
          >
            {loadingDeleteImage ? <span className="loading loading-spinner w-4 h-4 text-white"></span> : <Trash2 className="w-4 h-4 text-white" />}
          </button>

          {/* Bouton modifier photo */}
          <label className="absolute bottom-2 right-0 w-9 h-9 bg-primary transition-colors rounded-full flex items-center justify-center cursor-pointer shadow-lg"> 
            {loadingChangeImage ? <span className="loading loading-spinner w-4 h-4 text-white"></span> : <Camera className="w-4 h-4 text-white" />}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="mt-4 text-center">
          <h2 className="text-2xl font-semibold text-white">{name}</h2>
          <div className="badge badge-ghost gap-1 py-1 px-3">
            <ShieldCheck className="w-4 h-4" />
            {role}
          </div>
        </div>
        <p className="text-neutral-400 mt-1">{email}</p>
      </motion.div>

      {/* Informations personnelles */}
      <motion.div variants={itemVariants} className="card glass border border-white/6 bg-white/3">
        <div className="card-body p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="card-title text-xl text-base-content">Informations Personnelles</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
              <User size={18} />
            </div>
          </div>

          {/* Nom */}
          <div className="form-control mb-6">
            <label className="label">
              <span className="label-text label-text text-base-content">Nom complet</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isEditingName === loadingName}
                className="input input-bordered bg-white/5 border-white/10 text-white flex-1"
              />
              <button
                onClick={() => {
                  if (isEditingName) handleSaveName();
                  else setIsEditingName(true);
                }}
                disabled={loadingName}
                className="btn btn-sky-400"
              >
                {isEditingName ? (loadingName ? <span className="loading loading-spiner w-4 h-4"></span> : <Save className="w-4 h-4" />) : <Pencil className="w-4 h-4" />}
                {isEditingName ? (loadingName ? "Enregistrement..." : "Enregistrer") : "Modifier"}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text label-text text-base-content">Adresse email</span>
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEditingEmail === loadingEmail}
                className="input input-bordered bg-white/5 border-white/10 text-white flex-1"
              />
              <button
                onClick={() => {
                  if (isEditingEmail) handleSaveEmail();
                  else setIsEditingEmail(true);
                }}
                disabled={loadingEmail}
                className="btn btn-sky-400"
              >
                {isEditingEmail ? (loadingEmail ? <span className="loading loading-spiner w-4 h-4"></span> : <Save className="w-4 h-4" />) : <Pencil className="w-4 h-4" />}
                {isEditingEmail ? (loadingEmail ? "Enregistrement..." : "Enregistrer") : "Modifier"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Changement de mot de passe */}
      <motion.div variants={itemVariants} className="card glass border border-white/6 bg-white/3">
        <div className="card-body p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="card-title text-xl text-base-content">Mot de passe et Sécurité</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-base-100/10 p-2 text-primary/70">
              <Key size={18} />
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {passwordErrors.form && (
              <div
                className="text-error/90 bg-error/10 border border-error/20 rounded-lg p-3 text-sm"
                role="alert"
              >
                {passwordErrors.form}
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Mot de passe actuel</span>
              </label>
              <input
                className={`input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent ${passwordErrors.currentPassword ? "border-error/60" : "border-white/10"}`}
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setPasswordErrors((prev) => ({ ...prev, currentPassword: "" }));
                }}
                placeholder="••••••••"
                required
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-error/80 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Nouveau mot de passe</span>
              </label>
              <input
                className={`input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent ${passwordErrors.newPassword ? "border-error/60" : "border-white/10"}`}
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                placeholder="••••••••"
                required
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-error/80 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Confirmer le nouveau mot de passe</span>
              </label>
              <input
                className={`input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent ${passwordErrors.confirmPassword ? "border-error/60" : "border-white/10"}`}
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                placeholder="••••••••"
                required
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-error/80 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-sky-400 w-full mt-6"
            >
              {loading ? <span className="loading loading-spiner w-4 h-4"></span> : <Pencil className="w-4 h-4" />}
              {loading ? "Modification..." : "Modifier"}
            </button>
          </form>
        </div>
      </motion.div>

      <dialog
        ref={confirmModalRef}
        className="modal modal-bottom sm:modal-middle backdrop-blur-sm"
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-md w-full">
          
          {/* Header - Style cohérent */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/15 text-primary">
                <MailCheck size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base leading-tight">
                  Vérifier votre email
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Confirmation du changement d'adresse
                </p>
              </div>
            </div>
            <form method="dialog">
              <button className="btn btn-ghost btn-sm btn-square text-white/30 hover:text-white/70">
                <X size={16} />
              </button>
            </form>
          </div>

          {/* Corps du Modal */}
          <div className="px-6 py-8">
            {/* Code verification inputs */}
            <div className="form-control">
              <label className="text-[10px] font-semibold text-white/45 uppercase tracking-widest text-center mb-4">
                Entrez le code de sécurité
              </label>
              
              <div className="flex justify-center gap-2 sm:gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={confirmLoading}
                    className={`w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 
                      ${digit 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-white/5 border-white/10 text-white"
                      } ${confirmLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* Info Message - Style Alert épuré */}
            <div className="mt-8 flex gap-3 p-4 rounded-xl bg-info/5 border border-info/20">
              <Info size={18} className="text-info shrink-0 mt-0.5" />
              <p className="text-xs text-info/80 leading-relaxed">
                Un email contenant un code à 6 chiffres a été envoyé. Pensez à vérifier vos <b>courriers indésirables</b> si vous ne voyez rien.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/8 bg-white/2 flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={handleConfirm}
              disabled={!isCodeComplete || confirmLoading}
              whileHover={{ scale: !isCodeComplete || confirmLoading ? 1 : 1.02 }}
              whileTap={{ scale: confirmLoading ? 1 : 0.98 }}
              className="btn btn-primary btn-sm h-11 w-full gap-2 font-semibold"
            >
              {confirmLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  Confirmer l'adresse email
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>
    </motion.div>
  );
}