"use client";

import { getDefuntsList } from "@/app/actions/actions";
import Pagination from "@/components/uxComponents/Pagination";
import AddDefuntModal, { AddDefuntModalHandle } from "@/components/defuntsComponents/AddDefuntModal";
import DeleteDefuntModal, { DeleteDefuntModalHandle } from "@/components/defuntsComponents/DeleteDefuntModal";
import UpdateDefuntModal, { UpdateDefuntModalHandle } from "@/components/defuntsComponents/UpdateDefuntModal";
import ChangeStatutModal, { ChangeStatutModalHandle } from "@/components/defuntsComponents/ChangeStatutModal";
import ViewDefuntModal, { ViewDefuntModalHandle } from "@/components/defuntsComponents/ViewDefuntModal";
import { motion } from "framer-motion";
import {
  Bird,
  UserPlus,
  Search,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  SquarePen,
  RotateCcw,
  Trash2,
  Calendar,
  MapPin,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 25;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

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

export default function DefuntsPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [defunts, setDefunts] = useState<DefuntRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("nom-asc");
  const [families, setFamilies] = useState<any[]>([]);

  const addModalRef = useRef<AddDefuntModalHandle>(null);
  const updateModalRef = useRef<UpdateDefuntModalHandle>(null);
  const changeStatutModalRef = useRef<ChangeStatutModalHandle>(null);
  const deleteModalRef = useRef<DeleteDefuntModalHandle>(null);
  const viewModalRef = useRef<ViewDefuntModalHandle>(null);

  const debouncedSearch = useDebounce(search, 400);

  const loadDefunts = useCallback(async (page: number, q: string, ord: string) => {
    setLoading(true);
    try {
      const res = await getDefuntsList(page, q, ord);
      
      if (res == null) {
        toast.error("Session expirée ou accès refusé");
        setDefunts([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "error" in res && res.error) {
        toast.error(String(res.error));
        setDefunts([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "results" in res && res.results && "results" in res.results) {
        setDefunts(res.results.results as DefuntRow[]);
        const count = typeof res.count === "number" ? res.count : res.results.results.length;
        setTotalCount(count);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
        
        if (typeof res.results === "object" && "families" in res.results && Array.isArray(res.results.families)) {
          setFamilies(res.results.families);
        }
        return;
      }
      setDefunts([]);
      setTotalCount(0);
      setTotalPages(1);
    } catch {
      toast.error("Un problème est survenu pendant le chargement des données");
      setDefunts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ordering]);

  useEffect(() => {
    loadDefunts(currentPage, debouncedSearch, ordering);
  }, [currentPage, debouncedSearch, ordering, loadDefunts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  
  return (
    <>
      <AddDefuntModal
        ref={addModalRef}
        onSuccess={() => loadDefunts(1, debouncedSearch, ordering)}
        families={families}
      />
      <UpdateDefuntModal
        ref={updateModalRef}
        onSuccess={() => loadDefunts(currentPage, debouncedSearch, ordering)}
        families={families}
      />
      <ChangeStatutModal
        ref={changeStatutModalRef}
        onSuccess={() => loadDefunts(currentPage, debouncedSearch, ordering)}
      />
      <ViewDefuntModal
        ref={viewModalRef}
      />
      <DeleteDefuntModal
        ref={deleteModalRef}
        onSuccess={() => loadDefunts(currentPage, debouncedSearch, ordering)}
      />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bird className="w-8 h-8 shrink-0" />
            Défunts
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            Gérez et consultez vos souvenirs enregistrés.
          </p>
        </div>

        {/* Bouton Ajouter */}
        <motion.button
          type="button"
          onClick={() => addModalRef.current?.open()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm gap-2 shrink-0"
        >
          <UserPlus size={16} />
          Ajouter un défunt
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="rounded-2xl border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-4 sm:p-5">
            {/* Barre de recherche + tri */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <label className="relative flex-1 min-w-0 max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                  size={16}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom, prénom, profession…"
                  className="input input-bordered input-sm w-full pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/35 focus:border-primary/50"
                />
              </label>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <ChevronsUpDown size={16} className="text-white/35 hidden sm:block" />
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="select select-bordered select-sm w-full sm:w-52 bg-white/5 border-white/10 text-white focus:border-primary/50"
                  aria-label="Trier la liste"
                >
                  <option value="nom-asc">Trier par nom (A à Z)</option>
                  <option value="nom-desc">Trier par nom (Z à A)</option>
                  <option value="age-asc">Trier par âge (croissant)</option>
                  <option value="age-desc">Trier par âge (décroissant)</option>
                  <option value="statut-incinere">Trier par statut (Incinérés)</option>
                  <option value="statut-inhume">Trier par statut (Inhumés)</option>
                  <option value="recent">Trier par date de création</option>
                </select>
              </div>
            </div>

            {/* Grille de cartes */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-xl border border-white/6 bg-white/3 p-4 min-h-64">
                      <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-white/10 rounded mb-2 w-3/4 mx-auto"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : defunts.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {defunts.map((defunt, i) => (
                  <motion.div
                    key={defunt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                    className="group relative overflow-hidden"
                  >
                    <div className="rounded-xl border border-white/6 bg-white/3 p-4 flex flex-col justify-between min-h-64 hover:border-white/12 transition-all duration-300 hover:bg-white/5">
                      {/* Actions dropdown */}
                      <div className="absolute top-2 right-2 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <div className="dropdown dropdown-end">
                          <button
                            type="button"
                            tabIndex={0}
                            className="btn btn-ghost btn-xs btn-square bg-black/20 hover:bg-black/40 text-white/60 hover:text-white border-0"
                            aria-label="Actions"
                          >
                            <MoreHorizontal size={13} />
                          </button>
                          <ul
                            tabIndex={0}
                            className="dropdown-content menu p-2 shadow bg-neutral-900 border border-white/10 rounded-box w-40 z-50"
                          >
                            <li>
                              <button
                                type="button"
                                onClick={() => viewModalRef.current?.open(defunt)}
                                className="justify-start gap-2 text-white/80 hover:text-white"
                              >
                                <Eye size={14} />
                                Voir
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => updateModalRef.current?.open(defunt)}
                                className="justify-start gap-2 text-white/80 hover:text-white"
                              >
                                <SquarePen size={14} />
                                Modifier
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => changeStatutModalRef.current?.open(defunt)}
                                className="justify-start gap-2 text-warning/80 hover:text-warning"
                                title="Changer le statut de Inhumé à Incinéré"
                              >
                                <RotateCcw size={14} />
                                Changer statut
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => deleteModalRef.current?.open(defunt)}
                                className="justify-start gap-2 text-error/80 hover:text-error"
                              >
                                <Trash2 size={14} />
                                Supprimer
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Photo du défunt */}
                      <div className="flex justify-center mb-3">
                        {defunt.photo ? (
                          <img
                            src={defunt.photo}
                            alt={`${defunt.nom} ${defunt.prenom || ''}`}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-white/10">
                            <Bird className="w-8 h-8 text-primary/40" />
                          </div>
                        )}
                      </div>

                      {/* Informations principales */}
                      <div className="text-center flex-1">
                        <h3 className="font-semibold text-white text-base mb-1 truncate w-full" title={`${defunt.nom} ${defunt.prenom || ''}`}>
                          {defunt.nom} {defunt.prenom}
                        </h3>
                        <p className="text-white/60 text-sm mb-3 truncate w-full">
                          {defunt.profession || 'Profession non spécifiée'}
                        </p>

                        {/* Informations secondaires */}
                        <div className="space-y-1 text-xs text-white/40">
                          <div className="flex items-center justify-center gap-1">
                            <Calendar size={10} />
                            <span>{formatDate(defunt.date_deces)}</span>
                            <span className="text-white/30">•</span>
                            <span>{defunt.age} ans</span>
                          </div>
                          {defunt.place && (
                            <div className="flex items-center justify-center gap-1">
                              <MapPin size={10} />
                              <span>Place {defunt.place}</span>
                            </div>
                          )}
                          {defunt.famille_details?.nom_famille && (
                            <div className="flex items-center justify-center gap-1">
                              <Users size={10} />
                              <span>{defunt.famille_details.nom_famille}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className={`badge badge-xs border-0 w-full justify-center ${
                          defunt.statut === 'Inhumé' 
                            ? 'badge-success' 
                            : defunt.statut === 'Incinéré'
                            ? 'badge-warning'
                            : 'badge-neutral'
                        }`}>
                          {defunt.statut}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bird className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {search ? `Aucun résultat pour "${search}"` : "Aucun défunt enregistré"}
                </h3>
                <p className="text-neutral-400">
                  {search 
                    ? "Essayez avec d'autres termes de recherche."
                    : "Commencez par ajouter votre premier défunt à Memorium."
                  }
                </p>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
    </>
  );
}
