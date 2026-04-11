"use client";

import { confirmNewEmail, getUserProfil, updatePassword, updateUserProfil, uploadProfilPhoto } from "@/app/actions/actions";
import { motion } from "framer-motion";
import { User, Camera, ShieldCheck, Key, Save, Pencil, Trash2 } from "lucide-react";
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
      setUserImage(res.photo ? res.photo : "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka")
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
      photo : "",
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

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }
    if (currentPassword == newPassword) {
      toast.error("Le nouveau mot de passe ne doit etre different du mot de passe actuel");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Le nouveau mot de passe doit faire au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await updatePassword(formData);

      if (result.error) {
        toast.error(result.error);
        return
      } else {
        toast.success(result.data?.message || "Mot de passe mis à jour !");
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Keep only last character
    setCode(newCode);

    // Auto-focus next input
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

      // Focus last input if all filled
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
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Mot de passe actuel</span>
              </label>
              <input
                className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent"
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Nouveau mot de passe</span>
              </label>
              <input
                className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent"
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Confirmer le nouveau mot de passe</span>
              </label>
              <input
                className="input input-bordered focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full bg-transparent"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
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

      <dialog ref={confirmModalRef} className="modal backdrop-blur">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Confirmation du nouveau mail</h3>
          <div
            // className="flex flex-col gap-4 mt-4"
          >
            <div className="card-body">

              {/* Code verification inputs */}
              <div className="mt-6">
                <label className="label">
                  <span className="label-text text-base-content/70">
                    Code de vérification
                  </span>
                </label>
                <div className="mt-2 flex justify-center gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={confirmLoading}
                      className={`input input-bordered h-14 w-12 text-center text-lg font-bold transition-all duration-200 ${loading ? "opacity-50 cursor-not-allowed" : ""
                        } ${digit ? "input-primary" : ""}`}
                    />
                  ))}
                </div>
              </div>

              {/* Info message about sent email */}
              <div className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4">
                <p className="text-sm text-base-content/80">
                  Un email de confirmation a été envoyé à votre adresse email.
                  Veuillez vérifier votre boîte de réception et votre dossier
                  spam.
                </p>
              </div>

              {/* Verification button */}
              <button
                onClick={handleConfirm}
                disabled={!isCodeComplete || confirmLoading}
                className="btn btn-primary btn-block mt-6"
              >
                {confirmLoading ? (
                    <span className="loading loading-spinner loading-sm text-primary"></span>
                ) : (
                    "Vérifier le code"
                )}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </motion.div>
  );
}