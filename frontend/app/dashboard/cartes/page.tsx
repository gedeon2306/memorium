"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Map } from "lucide-react";

// Liste des défunts (à remplacer par tes vraies données plus tard)
const defunts = [
  { id: 5,   nom: "Nguesso Paul",     profession: "Médecin",      deces: "10/02/2024", incin: "10/02/2025", famille: "Épouse : Marie Nguesso",    bientot: false },
  { id: 12,  nom: "Moukala Élise",    profession: "Enseignante",  deces: "15/03/2024", incin: "15/03/2025", famille: "Fils : Pierre Moukala",      bientot: false },
  { id: 23,  nom: "Ibara Louis",      profession: "Commerçant",   deces: "05/01/2024", incin: "05/01/2025", famille: "Fille : Claire Ibara",       bientot: false },
  { id: 31,  nom: "Mabiala Yvette",   profession: "Infirmière",   deces: "20/05/2024", incin: "10/05/2025", famille: "Mari : Joseph Mabiala",      bientot: true  },
  { id: 44,  nom: "Loemba Théophile", profession: "Enseignant",   deces: "01/06/2024", incin: "01/06/2025", famille: "Mère : Adèle Loemba",        bientot: false },
  { id: 57,  nom: "Bouanga Rosine",   profession: "Comptable",    deces: "18/04/2024", incin: "05/05/2025", famille: "Frère : Denis Bouanga",      bientot: true  },
  { id: 68,  nom: "Nkouka Marcel",    profession: "Ingénieur",    deces: "30/12/2023", incin: "30/12/2024", famille: "Femme : Pascaline Nkouka",   bientot: false },
  { id: 79,  nom: "Yoka Bernadette",  profession: "Retraitée",    deces: "07/07/2024", incin: "07/07/2025", famille: "Fils : Arnaud Yoka",         bientot: false },
  { id: 88,  nom: "Massamba Henri",   profession: "Avocat",       deces: "14/08/2024", incin: "14/08/2025", famille: "Fille : Sandrine Massamba",  bientot: false },
  { id: 102, nom: "Ngoma Cécile",     profession: "Sage-femme",   deces: "22/09/2024", incin: "22/09/2025", famille: "Mari : Victor Ngoma",        bientot: false },
  { id: 201, nom: "Dupont Marie",     profession: "Enseignante",  deces: "01/01/2025", incin: "01/01/2026", famille: "Fils : Jean Dupont",         bientot: false },
];

const TOTAL = 250;

export default function CartesPage() {
  const [selection, setSelection] = useState(null);

  const defuntSelectionne = defunts.find((d) => d.id === selection);

  function getCouleur(id : any) {
    const defunt = defunts.find((d) => d.id === id);
    if (!defunt) return "bg-emerald-500 hover:bg-emerald-400";
    if (defunt.bientot) return "bg-amber-400 hover:bg-amber-300";
    return "bg-red-500 hover:bg-red-400";
  }

  function handleClic(id : any) {
    setSelection(selection === id ? null : id);
  }

  const nbOccupes = defunts.length;
  const nbLibres = TOTAL - nbOccupes;
  const taux = Math.round((nbOccupes / TOTAL) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Titre */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Map className="w-8 h-8" />
          Carte du cimetière
        </h1>
        <p className="mt-2 text-base text-neutral-400">
          Cliquez sur un emplacement pour voir ses informations.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Total</p>
          <p className="text-2xl font-semibold text-white">{TOTAL}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Occupés</p>
          <p className="text-2xl font-semibold text-red-400">{nbOccupes}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Disponibles</p>
          <p className="text-2xl font-semibold text-emerald-400">{nbLibres}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Taux de remplissage</p>
          <p className={`text-2xl font-semibold ${taux >= 90 ? "text-red-400" : "text-white"}`}>
            {taux}%
          </p>
        </div>
      </div>

      {/* Carte */}
      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6 space-y-5">

          {/* Légende */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Disponible
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-red-500" /> Occupé
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-amber-400" /> Incinération prochaine
            </div>
          </div>

          {/* Grille des 250 emplacements */}
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
          >
            {Array.from({ length: TOTAL }, (_, i) => i + 1).map((id) => (
              <button
                key={id}
                onClick={() => handleClic(id)}
                title={`Emplacement ${id}`}
                className={`aspect-square rounded-sm transition-all duration-100 ${getCouleur(id)} ${
                  selection === id ? "ring-2 ring-white scale-125 z-10 relative" : ""
                }`}
              />
            ))}
          </div>

          {/* Fiche d'information */}
          {selection !== null && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 bg-white/4 p-5"
            >
              {defuntSelectionne ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{defuntSelectionne.nom}</p>
                      <p className="text-xs text-neutral-500">
                        {defuntSelectionne.profession} — Emplacement #{selection}
                      </p>
                    </div>
                    {defuntSelectionne.bientot && (
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-400">
                        Incinération prochaine
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-white/5 text-xs">
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500">Date de décès</span>
                      <span className="text-neutral-200">{defuntSelectionne.deces}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500">Date d'incinération</span>
                      <span className="text-neutral-200">{defuntSelectionne.incin}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-neutral-500">Famille</span>
                      <span className="text-neutral-200">{defuntSelectionne.famille}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                    Disponible
                  </span>
                  <p className="text-sm text-neutral-400">
                    Emplacement #{selection} — Aucun défunt enregistré
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {selection === null && (
            <p className="text-center text-xs text-neutral-600">
              Cliquez sur un emplacement pour afficher ses informations
            </p>
          )}

        </div>
      </div>
    </motion.div>
  );
}