"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Map } from "lucide-react";
import { getDefuntsMap } from "@/app/actions/actions";

const TOTAL = 250;

export default function CartesPage() {
  const [selection, setSelection] = useState<number | null>(null);
  const ficheRef = useRef<HTMLDivElement>(null);
  const [defunts, setDefunts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDefunts = async () => {
      try {
        const data = await getDefuntsMap();
        if (data && !data.error) {
          const transformedData = data.map((defunt: any) => ({
            id: defunt.place,
            nom: `${defunt.nom} ${defunt.prenom || ''}`.trim(),
            profession: defunt.profession || 'Non spécifiée',
            deces: new Date(defunt.date_deces).toLocaleDateString('fr-FR'),
            incin: new Date(defunt.date_incineration).toLocaleDateString('fr-FR'),
            famille: defunt.famille_details ? 
              `${defunt.famille_details.nom_famille} (${defunt.famille_details.nom_garrant})` : 
              'Non spécifiée',
            bientot: isSoon(new Date(defunt.date_incineration))
          }));
          setDefunts(transformedData);
        } else {
          setError(data?.error || 'Erreur de chargement');
        }
      } catch (err) {
        setError('Erreur de connexion au serveur');
      } finally {
        setLoading(false);
      }
    };

    loadDefunts();
  }, []);

  function isSoon(incinerationDate: Date): boolean {
    const today = new Date();
    const timeDiff = incinerationDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30;
  }

  const defuntSelectionne = defunts.find((d) => d.id === selection);

  function getCouleur(id: number) {
    const defunt = defunts.find((d) => d.id === id);
    if (!defunt) return "bg-success hover:bg-emerald-500";
    if (defunt.bientot) return "bg-warning hover:bg-amber-300";
    return "bg-error hover:bg-red-500";
  }

  function handleClic(id: number) {
    setSelection(selection === id ? null : id);
    setTimeout(() => {
      ficheRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const nbOccupes = defunts.length;
  const nbLibres = TOTAL - nbOccupes;
  const taux = Math.round((nbOccupes / TOTAL) * 100);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-neutral-400">Chargement de la carte du cimetière...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="alert alert-error">
          <span>Erreur: {error}</span>
        </div>
      </motion.div>
    );
  }

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
          <p className="text-2xl font-semibold text-error">{nbOccupes}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Disponibles</p>
          <p className="text-2xl font-semibold text-success">{nbLibres}</p>
        </div>
        <div className="rounded-2xl border border-white/6 bg-white/3 p-4">
          <p className="text-xs text-neutral-500 mb-1">Taux de remplissage</p>
          <p className={`text-2xl font-semibold ${taux >= 90 ? "text-error" : "text-white"}`}>
            {taux}%
          </p>
        </div>
      </div>

      {/* Carte */}
      <div className="rounded-2xl border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6 space-y-5">

          {/* Légende */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-success" /> Disponible
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-error" /> Occupé
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-3 w-3 rounded-sm bg-warning" /> Incinération prochaine
            </div>
          </div>

          {/* Grille des 250 emplacements */}
          <div
            className="grid gap-0.75"
            style={{ gridTemplateColumns: "repeat(25, minmax(0, 1fr))" }}
          >
            {Array.from({ length: TOTAL }, (_, i) => i + 1).map((id) => (
              <button
                key={id}
                onClick={() => handleClic(id)}
                title={`Emplacement ${id}`}
                className={`aspect-square rounded-sm transition-all duration-100 hover:scale-125 hover:ring-2 hover:ring-white hover:z-10 hover:relative cursor-pointer ${getCouleur(id)} ${
                            selection === id ? "ring-2 ring-white scale-125 z-10 relative" : ""
                          }`}
              />
            ))}
          </div>

          {/* Fiche d'information */}
          {selection !== null && (
            <motion.div
              ref={ficheRef}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/8 bg-white/4 p-5"
            >
              {defuntSelectionne ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{defuntSelectionne.nom}</p>
                      <p className="text-xs text-neutral-200">
                        {defuntSelectionne.profession} — Emplacement #{selection}
                      </p>
                    </div>
                    {defuntSelectionne.bientot && (
                      <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-warning">
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
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-success">
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
            <p className="text-center text-sm">
              Cliquez sur un emplacement pour afficher ses informations
            </p>
          )}

        </div>
      </div>
    </motion.div>
  );
}