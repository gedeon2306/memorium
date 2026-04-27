"use client";

import { motion } from "framer-motion";
import { Bird, X, Calendar, MapPin, User, Users, Briefcase, Printer } from "lucide-react";
import { useRef, forwardRef, useImperativeHandle, useState } from "react";
import toast from "react-hot-toast";

type DefuntRow = {
  id: string;
  photo?: string;
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
  statut: string;
  famille?: string;
  famille_details?: any;
  user_name?: string;
  created_at?: string;
};

interface ViewDefuntModalProps {
  defunt?: DefuntRow | null;
}

export interface ViewDefuntModalHandle {
  open: (defunt: DefuntRow) => void;
  close: () => void;
}

const ViewDefuntModal = forwardRef<ViewDefuntModalHandle, ViewDefuntModalProps>(
  ({ defunt }, ref) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [currentDefunt, setCurrentDefunt] = useState<DefuntRow | null>(null);

    useImperativeHandle(ref, () => ({
      open: (defuntData: DefuntRow) => {
        setCurrentDefunt(defuntData);
        dialogRef.current?.showModal();
      },
      close: () => {
        dialogRef.current?.close();
        setCurrentDefunt(null);
      },
    }));

    const close = () => {
      dialogRef.current?.close();
      setCurrentDefunt(null);
    };

    const handlePrint = () => {
      close();
      toast.success("Bientôt disponible");
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    const getGenreLabel = (genre: string) => {
      return genre === 'M' ? 'Masculin' : 'Féminin';
    };

    if (!currentDefunt) return null;

    return (
      <dialog
        ref={dialogRef}
        className="modal modal-bottom sm:modal-middle"
        onClose={close}
      >
        <div className="modal-box bg-neutral-900 border border-white/10 shadow-2xl p-0 overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/15 text-primary shrink-0">
                <Bird size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white text-base leading-tight">
                  Fiche complète du défunt
                </h3>
                <p className="text-xs text-white/35 mt-0.5">
                  Consultez toutes les informations détaillées
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

          {/* Content */}
          <div className="px-6 py-5 overflow-y-auto flex-1">
            {/* Photo et informations principales */}
            <div className="flex flex-col sm:flex-row gap-6 mb-8">
              {/* Photo */}
              <div className="shrink-0">
                {currentDefunt.photo ? (
                  <img
                    src={currentDefunt.photo}
                    alt={`${currentDefunt.nom} ${currentDefunt.prenom || ''}`}
                    className="w-32 h-32 rounded-full object-cover border-2 border-white/10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-white/10">
                    <Bird className="w-16 h-16 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Informations principales */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {currentDefunt.nom} {currentDefunt.prenom || ''}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-white/40" />
                    <span className="text-white/60">Genre:</span>
                    <span className="text-white font-medium">{getGenreLabel(currentDefunt.genre)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-white/40" />
                    <span className="text-white/60">Âge:</span>
                    <span className="text-white font-medium">{currentDefunt.age} ans</span>
                  </div>
                  
                  {currentDefunt.profession && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-white/40" />
                      <span className="text-white/60">Profession:</span>
                      <span className="text-white font-medium">{currentDefunt.profession}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      currentDefunt.statut === 'Inhumé' 
                        ? 'bg-success' 
                        : currentDefunt.statut === 'Incinéré'
                        ? 'bg-warning'
                        : 'bg-neutral'
                    }`} />
                    <span className="text-white/60">Statut:</span>
                    <span className="text-white font-medium">{currentDefunt.statut}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections détaillées */}
            <div className="space-y-6">
              {/* Dates importantes */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar size={14} />
                  Dates importantes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date de naissance</p>
                    <p className="text-sm text-white/90">{formatDate(currentDefunt.date_naiss)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date de décès</p>
                    <p className="text-sm text-white/90">{formatDate(currentDefunt.date_deces)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date d'inhumation</p>
                    <p className="text-sm text-white/90">{formatDate(currentDefunt.date_inhumation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Date d'incinération</p>
                    <p className="text-sm text-white/90">{formatDate(currentDefunt.date_incineration)}</p>
                  </div>
                </div>
              </div>

              {/* Emplacement et famille */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={14} />
                  Emplacement et famille
                </h3>
                <div className="space-y-3">
                  {currentDefunt.place && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Place attribuée</p>
                      <p className="text-sm text-white/90">Place {currentDefunt.place}</p>
                    </div>
                  )}
                  
                  {currentDefunt.famille_details?.nom_famille && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Famille</p>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-white/40" />
                        <p className="text-sm text-white/90">
                          {currentDefunt.famille_details.nom_famille} - {currentDefunt.famille_details.nom_garrant}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations système */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                  Informations système
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentDefunt.user_name && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Ajouté par</p>
                      <p className="text-sm text-white/90">{currentDefunt.user_name}</p>
                    </div>
                  )}
                  
                  {currentDefunt.created_at && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Date d'ajout</p>
                      <p className="text-sm text-white/90">{formatDate(currentDefunt.created_at)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-white/40 mb-1">ID du défunt</p>
                    <p className="text-sm text-white/90 font-mono">{currentDefunt.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/8 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost btn-sm gap-2 text-white/50 hover:text-white/80"
            >
              <Printer size={14} />
              Imprimer
            </button>
            <button
              type="button"
              onClick={close}
              className="btn btn-primary btn-sm gap-2"
            >
              Fermer
            </button>
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button type="submit">Fermer</button>
        </form>
      </dialog>
    );
  }
);

ViewDefuntModal.displayName = "ViewDefuntModal";
export default ViewDefuntModal;
