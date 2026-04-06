"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Bell, Palette, LogOut, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER MON COMPTE") {
      toast.error("Veuillez taper 'SUPPRIMER MON COMPTE' pour confirmer");
      return;
    }
    
    try {
      // API call to delete account
      // await deleteAccount();
      toast.success("Compte supprimé avec succès");
      // Redirect to home page
      // router.push("/");
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
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
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
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
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </div>
            <div className="divider my-2"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Newsletters</p>
                <p className="text-sm text-neutral-400">Recevoir nos dernières actualités</p>
              </div>
              <input type="checkbox" className="toggle toggle-primary" />
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
          className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card glass w-full max-w-md bg-error/10 shadow-2xl"
          >
            <div className="card-body p-8">
              <h3 className="card-title text-error text-lg mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Supprimer le compte ?
              </h3>
              <p className="text-neutral-300 mb-3">
                Cette action ne peut pas être annulée. Toutes vos données seront supprimées définitivement.
              </p>

              {/* Confirmation Input */}
              <div className="form-control mb-6">
                <label className="label mb-4">
                  <span className="label-text text-neutral-300">
                    Tapez <span className="font-semibold text-error">"SUPPRIMER MON COMPTE"</span> pour confirmer :
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="SUPPRIMER MON COMPTE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="input input-bordered focus:outline-none focus:ring-2 focus:ring-error w-full focus:border-transparent border-error placeholder-neutral-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="card-actions justify-between gap-3">
                <button 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation("");
                  }}
                  className="btn btn-ghost flex-1"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmation !== "SUPPRIMER MON COMPTE"}
                  className="btn btn-error flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
