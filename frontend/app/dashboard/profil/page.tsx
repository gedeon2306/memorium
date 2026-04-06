"use client";

import { motion } from "framer-motion";
import { User, Camera, ShieldCheck, Mail, Key, Save, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [profileImage, setProfileImage] = useState<string>(
    "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka"
  );
  const [name, setName] = useState("Gédéon Gangoué");
  const [email, setEmail] = useState("contact@jihreldev.com");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingName, setLoadingName] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  const role = "Administrateur";

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
        toast.success("Photo de profil mise à jour");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    setLoadingName(true)
    setTimeout(()=>{
      try {
        toast.success("Nom mis à jour avec succès");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du nom");
      } finally {
        setIsEditingName(false);
        setLoadingName(false)
      }
    }, 3000)
  };

  const handleSaveEmail = () => {
    if (!email.includes("@")) {
      toast.error("Email invalide");
      return;
    }
    
    setLoadingEmail(true)
    setTimeout(()=>{
      try {
        toast.success("Email mis à jour avec succès");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour de l'email");
      } finally {
        setIsEditingEmail(false);
        setLoadingEmail(false)
      }
    }, 3000)
    
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Tous les champs sont obligatoires");
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
    setTimeout(()=>{
      try {
        toast.success("Mot de passe modifié avec succès");
        // setCurrentPassword("");
        // setNewPassword("");
        // setConfirmPassword("");
      } catch (error) {
        toast.error("Erreur lors du changement de mot de passe");
      } finally {
        setLoading(false);
      }
    }, 3000)
  };

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
              src={profileImage}
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Bouton supprimer photo */}
          <button 
            disabled={profileImage == "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka"}
            onClick={() => {if(profileImage != "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka") setProfileImage("https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Aneka")} }
            className="btn btn-secondary absolute top-1 left-0 w-9 h-9 rounded-full flex items-center p-0 justify-center"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>

          {/* Bouton modifier photo */}
          <label className="absolute bottom-2 right-0 w-9 h-9 bg-primary transition-colors rounded-full flex items-center justify-center cursor-pointer shadow-lg">
            <Camera className="w-4 h-4 text-white" />
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
                name="password"
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
                name="confirmePassword"
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
    </motion.div>
  );
}