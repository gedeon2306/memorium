"use client";

import { deleteUserProfil, getUserProfil, updateUserProfil } from "@/app/actions/actions";
import { ROUTES } from "@/constants/routes";
import axios from "axios";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [dfa, setDfa] = useState(true)
  const [loading, setLoading] = useState(true)

  const loadProfil = async () => {
    setLoading(true);
    try {
      const res = await getUserProfil();
      setDfa(res.dfa);
    } catch (err) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfil();
  }, []);

  const handleChangeDfa = async () => {
    const newValue = !dfa;
    const data = { dfa: newValue };
    const action = "updatePut";

    setLoading(true);
    try {
      const result = await updateUserProfil(data, action);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.data?.message || "Mise à jour réussie !");
        setDfa(newValue); 
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER MON COMPTE") {
      toast.error("Veuillez taper 'SUPPRIMER MON COMPTE' pour confirmer");
      return;
    }

    setLoading(true);
    try {
      const success = await deleteUserProfil();
      if (success) {
        toast.success('Compte supprimé avec succès.');
        setLoading(true)
        
        await axios.post('/api/logout');
        router.replace(ROUTES.AUTH.LOGIN);

      } else {
        toast.error('Erreur lors de la suppression du compte.');
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          <Settings className="w-8 h-8" />
          Paramètres
        </h1>
        <p className="mt-2 text-base text-neutral-400">
          Configurez vos préférences et les paramètres de sécurité.
        </p>
      </motion.div>

      {/* Profil Section */}
      <motion.div variants={itemVariants} className="card glass border border-white/6 bg-white/3">
        <div className="card-body p-8">
          <h2 className="card-title text-white text-xl mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-400" />
            Profil & Sécurité
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">Authentification à deux facteurs</p>
                <p className="text-sm text-neutral-400">Activée</p>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={dfa}
                disabled={loading}
                onChange={handleChangeDfa}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notifications Section */}
      <motion.div variants={itemVariants} className="card glass border border-white/6 bg-white/3">
        <div className="card-body p-8">
          <h2 className="card-title text-white text-xl mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Notifications par email</p>
                <p className="text-sm text-neutral-400">Recevoir des alertes importantes</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked disabled />
            </div>
            <div className="divider my-2"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Newsletters</p>
                <p className="text-sm text-neutral-400">Recevoir nos dernières actualités</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked disabled />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone - Account Deletion */}
      <motion.div 
        variants={itemVariants} 
        className="card border-2 border-error bg-error/10"
      >
        <div className="card-body p-8">
          <h2 className="card-title text-error text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zone Dangereuse
          </h2>
          <p className="text-neutral-300 mb-6">
            Les actions dans cette section sont irréversibles. Soyez prudent.
          </p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline btn-error w-fit gap-3"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </button>
        </div>
      </motion.div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden max-w-md w-full rounded-2xl"
          >
            {/* Header - Style cohérent avec le premier modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-error/15 text-error">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base leading-tight">
                    Supprimer le compte
                  </h3>
                  <p className="text-xs text-white/35 mt-0.5">
                    Cette action est irréversible
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="btn btn-ghost btn-sm btn-square text-white/30 hover:text-white/70"
              >
                <X size={16} />
              </button>
            </div>

            {/* Corps du modal */}
            <div className="px-6 py-6">
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Toutes vos données seront supprimées définitivement de Memorium. 
                Veuillez confirmer votre intention ci-dessous.
              </p>

              {/* Confirmation Input - Style adapté au premier modal */}
              <div className="form-control gap-1.5">
                <label className="text-[10px] font-semibold text-white/45 uppercase tracking-[0.1em]">
                  Confirmation requise
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder='Tapez "SUPPRIMER MON COMPTE"'
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="input input-sm w-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-error/60 transition-colors py-5"
                  />
                </div>
                <p className="text-[11px] text-white/30 mt-1">
                  Écrivez en majuscules pour déverrouiller le bouton.
                </p>
              </div>
            </div>

            {/* Footer - Boutons d'action */}
            <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3 bg-white/[0.02]">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation("");
                }}
                className="btn btn-ghost btn-sm text-white/50 hover:text-white/80"
              >
                Annuler
              </button>
              
              <motion.button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== "SUPPRIMER MON COMPTE" || loading}
                whileHover={{ scale: loading || deleteConfirmation !== "SUPPRIMER MON COMPTE" ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className={`btn btn-sm gap-2 min-w-28 ${
                  deleteConfirmation === "SUPPRIMER MON COMPTE" 
                  ? "btn-error shadow-lg shadow-error/20" 
                  : "btn-disabled bg-white/5 text-white/20 border-white/5"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Suppression…
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Supprimer définitivement
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
